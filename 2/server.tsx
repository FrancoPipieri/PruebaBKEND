import { serve } from "https://deno.land/std/http/server.ts";
import React, { useState } from "https://esm.sh/react@17.0.2";
import ReactDOMServer from "https://esm.sh/react-dom@17.0.2/server";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const app = new Application();
const router = new Router();

router
  .options("/colors", oakCors())
  .post("/colors", oakCors(), async (ctx) => {
    const body = await ctx.request.body();
    const color = body.value.color;
    if (typeof color !== "string" || color.trim().length === 0) {
      ctx.response.status = 400;
      ctx.response.body = "Invalid color";
      return;
    }
    colors.push(color.trim().toLowerCase());
    ctx.response.status = 204;
  })
  .get("/", (ctx) => {
    const app = <App colors={colors} />;
    const body = ReactDOMServer.renderToString(app);
    ctx.response.body = renderTemplate(body);
  });

app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen({ port: 8000 });
console.log("Server listening on http://localhost:8000");

let colors: string[] = [];

function renderTemplate(body: string) {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Colors App</title>
      </head>
      <body>
        <div id="root">${body}</div>
        <script type="module" src="/client.js"></script>
      </body>
    </html>`;
}

function App(props: { colors: string[] }) {
  const [newColor, setNewColor] = useState("");

  async function handleColorSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color: newColor }),
      });

      if (response.ok) {
        colors.push(newColor.trim().toLowerCase());
        setNewColor("");
      } else {
        alert(`Failed to add color: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert(`Failed to add color: ${error}`);
    }
  }

  function handleColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNewColor(event.target.value);
  }

  return (
    <div>
      <form onSubmit={handleColorSubmit}>
        <label>
          Ingrese un Color en Ingles:
          <input type="text" name="color" value={newColor} onChange={handleColorChange} />
        </label>
        <button type="submit">Add color</button>
      </form>
      <ul>
        {props.colors.map((color) => (
          <li key={color} style={{ color }}>
            {color}
          </li>
        ))}
      </ul>
    </div>
  );
}
