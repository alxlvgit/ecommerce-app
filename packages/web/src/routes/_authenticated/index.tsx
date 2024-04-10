import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

function HomePage() {
  const { getToken } = useKindeAuth();
  const getItems = async () => {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const res = await fetch(import.meta.env.VITE_APP_API_URL + "/items", {
      headers: {
        Authorization: token,
      },
    });

    if (!res.ok) {
      throw new Error("Something went wrong");
    }
    const data = await res.json();
    return data;
  };

  const { isPending, error, data } = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
  });
  console.log({ isPending, error, data });

  return <div className="">Home Page</div>;
}
