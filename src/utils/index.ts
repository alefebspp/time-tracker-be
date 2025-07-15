import { Service } from "@/types";

export function makeService<R, A, O>(
  repo: R,
  service: Service<R, A, O>
): (args: A) => Promise<O> {
  return service(repo);
}
