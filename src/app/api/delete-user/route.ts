
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, WriteBatch } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/firebase/admin-config';

// Initialize the Firebase Admin SDK
const adminApp = initializeAdminApp();
const adminAuth = getAuth(adminApp);
const adminFirestore = getFirestore(adminApp);


export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization header missing.' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        // Start a batch to delete all user data atomically
        const batch = adminFirestore.batch();

        // 1. Delete the user's main document
        const userDocRef = adminFirestore.collection('users').doc(uid);
        batch.delete(userDocRef);

        // 2. Delete all swipes initiated by the user
        const swipesMadeQuery = adminFirestore.collection('swipes').where('swiperId', '==', uid);
        const swipesMadeSnap = await swipesMadeQuery.get();
        swipesMadeSnap.forEach(doc => batch.delete(doc.ref));

        // 3. Delete all swipes received by the user
        const swipesReceivedQuery = adminFirestore.collection('swipes').where('targetId', '==', uid);
        const swipesReceivedSnap = await swipesReceivedQuery.get();
        swipesReceivedSnap.forEach(doc => batch.delete(doc.ref));

        // 4. Find and delete all matches and associated conversations
        const matchesQuery = adminFirestore.collection('matches').where('users', 'array-contains', uid);
        const matchesSnap = await matchesQuery.get();
        
        for (const doc of matchesSnap.docs) {
            const matchId = doc.id;
            // Delete the match document
            batch.delete(doc.ref);
            
            // Delete the associated conversation document
            const conversationRef = adminFirestore.collection('conversations').doc(matchId);
            batch.delete(conversationRef);

            // It's too complex to delete all sub-collection messages in a single batch efficiently.
            // A better approach for production would be a separate Cloud Function triggered on match deletion.
            // For now, we will leave the messages subcollection, as it will be orphaned and inaccessible.
        }

        // Commit the batch
        await batch.commit();

        return NextResponse.json({ success: true, message: 'User data deleted successfully.' });

    } catch (error: any) {
        console.error('Error deleting user data:', error);
        let errorMessage = 'An unexpected error occurred.';
        if (error.code === 'auth/id-token-expired') {
            errorMessage = 'Security token has expired. Please log in again.';
        } else if (error.code === 'auth/argument-error') {
            errorMessage = 'Invalid authorization token.';
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
