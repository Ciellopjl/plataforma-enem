import { requestResetAction } from "../src/app/login/password-reset-actions";

async function testReset() {
  console.log("--- Testing Password Reset Request ---");
  const res = await requestResetAction("ciellolisboa023@gmail.com");
  console.log("Result:", JSON.stringify(res, null, 2));
}

testReset();
