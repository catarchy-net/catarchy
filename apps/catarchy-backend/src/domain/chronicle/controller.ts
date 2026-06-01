import Elysia from "elysia";

export const chronicleRouter = () => {
  return new Elysia({
    prefix: "/chronicle",
    tags: ["Chronicle"],
  });
};
