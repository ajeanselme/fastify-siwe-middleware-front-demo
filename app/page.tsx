import MainModule from "./_components/mainModule";

export default function Home() {

  return (
    <MainModule apiURL={process.env.API_URL!} />
  );
}
