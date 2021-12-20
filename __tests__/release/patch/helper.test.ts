/**
 * Module dependencies
 */
import { getVisibleReleaseStatusLog } from "../../../src/release/patch/helper";
import { NpmNS } from "../../../src/release/types";

it("getVisibleReleaseStatusLog", () => {
  const log = getVisibleReleaseStatusLog(
    [
      {
        name: "@scope/foo",
        version: "2.1.2",
      },
      {
        name: "@scope/bar",
        version: "2.1.1",
      },
      {
        name: "@scope/baz",
        version: "2.1.2",
      },
      {
        name: "@scope/qux",
        version: "2.1.1",
      },
    ] as NpmNS.IRemotePackageInfo[],
    "2.1.2",
    "next"
  );
  console.log(log);
  expect(require("strip-ansi")(log)).toMatchSnapshot();
});
