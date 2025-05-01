"use strict";
const { Permit } = require("permitio");
// const { process } = require("node:process");

// Get arguments passed after the node executable and script name
const args = process.argv.slice(2);

let PERMIT_PDP = null;
let PERMIT_API_KEY = null;

// Define the prefixes we are looking for
const pdpPrefix = "--permit_pdp=";
const apiKeyPrefix = "--permit_api_key=";

// Loop through the arguments to find our specific ones
args.forEach((arg) => {
  if (arg.startsWith(pdpPrefix)) {
    // Extract the value after the prefix
    PERMIT_PDP = arg.substring(pdpPrefix.length);
  } else if (arg.startsWith(apiKeyPrefix)) {
    // Extract the value after the prefix
    PERMIT_API_KEY = arg.substring(apiKeyPrefix.length);
  }
});

// Now you can use the captured values
console.log("\n--- Parsed Values ---");
console.log("Permit PDP:", PERMIT_PDP);
console.log("Permit API Key:", PERMIT_API_KEY);
console.log("---------------------\n");

// Example usage: Check if values were provided
if (!PERMIT_PDP) {
  console.error("Error: --permit_pdp=value argument is missing!");
  // Optionally exit if it's required
  // process.exit(1);
}

if (!PERMIT_API_KEY) {
  console.error("Error: --permit_api_key=value argument is missing!");
  // Optionally exit if it's required
  // process.exit(1);
}

// This line initializes the SDK and connects your Node.js app
// to the Permit.io PDP container you've set up in the previous step.
const permit = new Permit({
  // in production, you might need to change this url to fit your deployment
  pdp: PERMIT_PDP,
  // your api key
  token: PERMIT_API_KEY,
});

// You can open http://localhost:4000 to invoke this http
// endpoint, and see the outcome of check.

const main = async () => {
  // Create a resource called "workspace"
  try {
    await permit.api.createResource({
      key: "workspace",
      name: "workspace",
      actions: {
        create: { name: "create" },
        read: { name: "read" },
        update: { name: "update" },
        delete: { name: "delete" },
        review: { name: "review" },
      },
      roles: {
        owner: {
          name: "owner",
          permissions: ["create", "read", "update", "delete", "review"],
        },
        editor: {
          name: "editor",
          permissions: ["create", "read", "update", "review"],
        },
        reviewer: {
          name: "reviewer",
          permissions: ["read", "update", "review"],
        },
        viewer: {
          name: "viewer",
          permissions: ["read"],
        },
      },
    });
  } catch (error) {
    console.error("Error creating workspace resource:", error);
    return;
  }

  // Create roles
  // Create a role called "admin"
  try {
    await permit.api.createRole({
      key: "admin",
      name: "admin",
      permissions: [
        "workspace:create",
        "workspace:read",
        "workspace:update",
        "workspace:delete",
        "workspace:review",
      ],
    });
  } catch (error) {
    console.error("Error creating admin role:", error);
    return;
  }

  // Create a role called "user"
  try {
    await permit.api.createRole({
      key: "user",
      name: "user",
      permissions: [
        "workspace:create",
        "workspace:read",
        "workspace:update",
        "workspace:delete",
        "workspace:review",
      ],
    });
  } catch (error) {
    console.error("Error creating user role:", error);
    return;
  }

  // Create user for example
  // Create a user called "alice"
  try {
    await permit.api.syncUser({
      key: "alice@gmail.com",
    });

    await permit.api.users.assignRole({
      user: "alice@gmail.com",
      role: "user",
      tenant: "default",
    });
  } catch (error) {
    console.error("Error creating alice user and assigning role:", error);
    return;
  }

  // Create a user called "bob"
  try {
    await permit.api.syncUser({
      key: "bob@gmail.com",
    });

    await permit.api.users.assignRole({
      user: "bob@gmail.com",
      role: "user",
      tenant: "default",
    });
  } catch (error) {
    console.error("Error creating bob user and assigning role:", error);
    return;
  }

  // Create alice's workspace
  try {
    await permit.api.resourceInstances.create({
      key: "alice-workspace",
      resource: "workspace",
      tenant: "default",
    });

    await permit.api.users.assignRole({
      user: "alice@gmail.com",
      resource_instance: `workspace:alice-workspace`,
      role: "owner",
    });
  } catch (error) {
    console.error(
      "Error creating alice's workspace and assigning role:",
      error
    );
    return;
  }

  // Create bob's workspace
  try {
    await permit.api.resourceInstances.create({
      key: "bob-workspace",
      resource: "workspace",
      tenant: "default",
    });

    await permit.api.users.assignRole({
      user: "bob@gmail.com",
      resource_instance: "workspace:bob-workspace",
      role: "owner",
    });
  } catch (error) {
    console.error("Error creating bob's workspace and assigning role:", error);
    return;
  }

  // Assign bob to alice's workspace as editor
  try {
    await permit.api.users.assignRole({
      user: "bob@gmail.com",
      resource_instance: "workspace:alice-workspace",
      role: "editor",
    });
  } catch (error) {
    console.error("Error assigning bob as editor to alice's workspace:", error);
    return;
  }

  // Assign alice to bob's workspace as viewer
  try {
    await permit.api.users.assignRole({
      user: "alice@gmail.com",
      resource_instance: "workspace:bob-workspace",
      role: "viewer",
    });
  } catch (error) {
    console.error("Error assigning alice as viewer to bob's workspace:", error);
    return;
  }
  // Check if alice is bob's workspace editor
  const aliceRoleOfBobWorkspace = await permit.getUserPermissions(
    "alice@gmail.com",
    [`workspace:bob-workspace`]
  );
  const isAliceEditorOfBob =
    aliceRoleOfBobWorkspace[`workspace:bob-workspace`].roles.includes("editor");
  const isAliceViewerOfBob =
    aliceRoleOfBobWorkspace[`workspace:bob-workspace`].roles.includes("viewer");
  console.log("Is Alice an editor of Bob's workspace?", isAliceEditorOfBob);
  console.log("Is Alice a viewer of Bob's workspace?", isAliceViewerOfBob);

  // Check if bob is alice's workspace editor
  const bobRoleOfAliceWorkspace = await permit.getUserPermissions(
    "bob@gmail.com",
    [`workspace:alice-workspace`]
  );
  const isBobEditorOfAlice =
    bobRoleOfAliceWorkspace[`workspace:alice-workspace`].roles.includes(
      "editor"
    );
  console.log("Is Bob an editor of Alice's workspace?", isBobEditorOfAlice);
};

main();
