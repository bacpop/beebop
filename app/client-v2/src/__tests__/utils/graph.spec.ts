import { describe, it, expect } from "vitest";
import { extractGraphMLKeys } from "../../utils/graph";

describe("extractGraphMLKeys", () => {
  it("should extract both node name and type keys from valid GraphML", () => {
    const graphML = `
      <graphml>
        <key id="key1" for="edge" attr.name="id" attr.type="string"/>
        <key id="key2" for="node" attr.name="label" attr.type="string"/>
        <key id="key3" for="node" attr.name="id" attr.type="string"/>
        <key id="key4" for="node" attr.name="ref_query" attr.type="string"/>
        <key id="key5" for="edge" attr.name="ref_query" attr.type="string"/>
      </graphml>
    `;
    const result = extractGraphMLKeys(graphML);
    expect(result).toEqual({ nodeNameKey: "key3", nodeTypeKey: "key4" });
  });

  it("should return default keys when graph is undefined", () => {
    const result = extractGraphMLKeys(undefined);
    expect(result).toEqual({ nodeNameKey: "key0", nodeTypeKey: "key1" });
  });

  it("should return default keys when graph is invalid", () => {
    const result = extractGraphMLKeys("<invalid></xml>");
    expect(result).toEqual({ nodeNameKey: "key0", nodeTypeKey: "key1" });
  });

  it("should return default keys when no node keys are present", () => {
    const graphML = `
      <graphml>
        <key id="key2" for="edge" attr.name="weight" attr.type="double"/>
      </graphml>
    `;
    const result = extractGraphMLKeys(graphML);
    expect(result).toEqual({ nodeNameKey: "key0", nodeTypeKey: "key1" });
  });

  it("should use default fallback when key has no id attribute", () => {
    const graphML = `
      <graphml>
        <key for="node" attr.name="id" attr.type="string"/>
        <key for="node" attr.name="ref_query" attr.type="string"/>
      </graphml>
    `;
    const result = extractGraphMLKeys(graphML);
    expect(result).toEqual({ nodeNameKey: "key0", nodeTypeKey: "key1" });
  });
});
