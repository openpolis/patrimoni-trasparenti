module.exports = function(doc) {
  doc.data.id = doc.data._id['$oid']
  delete doc.data._id
  console.log("data: " + JSON.stringify(doc.data.id))
  // console.log("transformer: " + JSON.stringify(doc))
  return doc
}
