import slugify from "slugify"

function camelize(str) {

  str = slugify(str, {
    replacement: ' ', // we want to keep spaces, but remove all other special characters
    strict:true,
    lower:true
  })

  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

export default camelize