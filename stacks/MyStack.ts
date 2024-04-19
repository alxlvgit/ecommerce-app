import { StackContext, Api, StaticSite, Bucket } from "sst/constructs";

export function API({ stack }: StackContext) {
  const audience = `api-shopping-app-${stack.stage}`;
  const assetsBucket = new Bucket(stack, "assets");
  const api = new Api(stack, "api", {
    authorizers: {
      myAuthorizer: {
        type: "jwt",
        jwt: {
          issuer: "https://ecommerceshopping.kinde.com",
          audience: [audience],
        },
      },
    },
    defaults: {
      authorizer: "myAuthorizer",
      function: {
        environment: {
          DRIZZLE_DATABASE_URL: process.env.DRIZZLE_DATABASE_URL!,
        },
      },
    },
    routes: {
      "GET /items": "packages/functions/src/items.handler",
      "GET /cart/{id}": {
        authorizer: "myAuthorizer",
        function: {
          handler: "packages/csharp/api-dotnet",
          runtime: "container",
        },
      },
      "POST /cart": {
        authorizer: "myAuthorizer",
        function: {
          handler: "packages/csharp/api-dotnet",
          runtime: "container",
        },
      },
      "POST /item": {
        authorizer: "myAuthorizer",
        function: {
          handler: "packages/functions/src/items.handler",
        },
      },
      "POST /item-to-cart": {
        authorizer: "myAuthorizer",
        function: {
          handler: "packages/functions/src/items.handler",
        },
      },
      "GET /cart-items/{cartId}": {
        authorizer: "myAuthorizer",
        function: {
          handler: "packages/functions/src/items.handler",
        },
      },
      "DELETE /item-in-cart/{id}": {
        authorizer: "myAuthorizer",
        function: {
          handler: "packages/functions/src/items.handler",
        },
      },
      "DELETE /item/{id}": "packages/functions/src/items.handler",
      "POST /signed-url": {
        function: {
          environment: {
            ASSETS_BUCKET_NAME: assetsBucket.bucketName,
          },
          handler: "packages/functions/src/s3.handler",
        },
      },
      "DELETE /delete": {
        function: {
          environment: {
            ASSETS_BUCKET_NAME: assetsBucket.bucketName,
          },
          handler: "packages/functions/src/s3.handler",
        },
      },
    },
  });

  api.attachPermissionsToRoute("POST /signed-url", [assetsBucket, "grantPut"]);
  api.attachPermissionsToRoute("DELETE /delete", [assetsBucket, "grantDelete"]);

  const web = new StaticSite(stack, "web", {
    path: "packages/web",
    buildOutput: "dist",
    buildCommand: "npm run build",
    environment: {
      VITE_APP_API_URL: api.url,
      VITE_APP_KINDE_AUDIENCE: audience,
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    WebsiteURL: web.url,
  });
}
