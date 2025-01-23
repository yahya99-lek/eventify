import { SignIn } from '@clerk/nextjs';

export default function Page() {
  console.log("SignIn component rendering");
  return <SignIn />;
}
