"use server";

import { currentUser } from "@clerk/nextjs/server";
import { SchematicClient } from "@schematichq/schematic-typescript-node";

const apiKey = process.env.SCHEMATIC_API_KEY;
const client = new SchematicClient({ apiKey });

// Get a temporary access token
export async function getTemporaryAccessToken() {
  console.log("Getting temporary access token...");
  const user = await currentUser();

  if (!user) {
    console.log("User not found");
    return null;
  }

  console.log("Issuing temp access token");

  const resp = await client.accesstokens.issueTemporaryAccessToken({
    resourceType: "company",
    lookup: { id: user.id },
  });

  console.log(
    "Token response received: ",
    resp.data ? "Success" : "No response",
  );

  return resp.data?.token;
}
