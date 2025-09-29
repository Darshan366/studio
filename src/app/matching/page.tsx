import MatchCard from './match-card';

export default function MatchingPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-bold">Find a Gym Partner</h1>
        <p className="text-muted-foreground">
          Swipe right to connect, or left to pass.
        </p>
      </div>
      <MatchCard />
    </div>
  );
}
