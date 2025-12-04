export interface GraphMLKeys {
  nodeNameKey: string;
  nodeTypeKey: string;
}

/**
 * Extract the node name and type keys from the graphML xml string.
 *
 * @example
 * ```xml
 * <key id="key4" for="node" attr.name="id" attr.type="string"/>
 * <key id="key5" for="node" attr.name="ref_query" attr.type="string"/>
 * ```
 * would return { nodeNameKey: "key4", nodeTypeKey: "key5" }
 *
 * @param graph The graphML xml as a string
 * @returns The node name and type keys that can be used to target the xml nodes
 */
export const extractGraphMLKeys = (graph: string | undefined): GraphMLKeys => {
  const graphMLKeys = { nodeNameKey: "key0", nodeTypeKey: "key1" };
  if (!graph) return graphMLKeys;

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(graph, "text/xml");
  const keys = xmlDoc.querySelectorAll("key[for='node']");

  for (const key of keys) {
    const id = key.getAttribute("id");
    const attrName = key.getAttribute("attr.name");
    if (attrName === "id") graphMLKeys.nodeNameKey = id || "key0";
    if (attrName === "ref_query") graphMLKeys.nodeTypeKey = id || "key1";
  }

  return graphMLKeys;
};
