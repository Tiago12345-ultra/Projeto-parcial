const ID_REGEX = /^[0-9a-fA-F]{24}$/;

function idValido(id) {
  return typeof id === "string" && ID_REGEX.test(id);
}

function formatarDocumento(doc) {
  if (!doc) return null;

  const { _id, ...resto } = doc;
  return { id: _id.toString(), ...resto };
}

module.exports = { idValido, formatarDocumento };
