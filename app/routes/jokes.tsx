import type {
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";

import stylesUrl from "~/styles/jokes.css";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const jokeListItems = await db.joke.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
    take: 5,
  });
  const user = await getUser(request);

  return json({ jokeListItems, user });
};

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix ジョークス"
              aria-label="Remix ジョークス"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  ロゴアウト
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">ログイン</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">ランダムなジョークを聞く</Link>
            <p>チェックすべきジョークをいくつか紹介します:</p>
            <ul>
              {data.jokeListItems.map(({ id, name }) => (
                <li key={id}>
                  <Link prefetch="intent" to={id}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
            自分のものを追加してください
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="jokes-footer">
        <div className="container">
          <Link reloadDocument to="/jokes.rss">
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}
