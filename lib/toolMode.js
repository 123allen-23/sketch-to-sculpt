export function getToolMode(assetsByKind) {
  const hasOriginal = !!assetsByKind?.original?.url;
  const hasRefined  = !!assetsByKind?.refined?.url;
  const hasRender   = !!assetsByKind?.render?.url || !!assetsByKind?.render3d?.url;
  const hasSculpt   = !!assetsByKind?.sculpt?.url;

  if (hasSculpt) return "COMMERCE";
  if (hasRender) return "RENDERED";
  if (hasRefined) return "REFINED";
  if (hasOriginal) return "ORIGINAL";
  return "EMPTY";
}
