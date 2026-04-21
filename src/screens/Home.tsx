import Button from "@/components/Button";
import HomeDevil from "@/components/HomeDevil";
import Screen from "@/components/Screen";

export default function Home() {
  return (
    <Screen>
      <HomeDevil>
        <h1 style={{ fontSize: "48px" }}>The Devil's Machine</h1>
        <Button imageName="start" as="link" to="/start">
          Start
        </Button>
      </HomeDevil>
    </Screen>
  );
}
