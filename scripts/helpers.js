/**
 * Halcyon Theme — helpers.js
 * Custom Hexo helper functions for word count and reading time
 */

var util = require('hexo-util');
var stripHTML = util.stripHTML;

function counter(content) {
  content = stripHTML(content);
  var cn = (content.match(/[一-龥]/g) || []).length;
  var en = (content.replace(/[一-龥]/g, '').match(/[a-zA-Z0-9_Β-ωЀ-ӿ]+|[一-鿿㐀-䶿豈-﫿぀-ゟ가-힯Ѐ-ӿ]+|[äÄåÅöÖ]+|\w+/g) || []).length;
  return [cn, en];
}

hexo.extend.helper.register('reading_time', function (content) {
  var len = counter(content);
  var minutes = len[0] / 300 + len[1] / 160;
  return minutes < 1 ? 1 : parseInt(minutes, 10);
});

hexo.extend.helper.register('word_count', function (content) {
  var len = counter(content);
  var count = len[0] + len[1];
  if (count < 1000) return count;
  return Math.round(count / 100) / 10 + 'k';
});

hexo.extend.helper.register('total_word_count', function (site) {
  var count = 0;
  site.posts.forEach(function (post) {
    var len = counter(post.content);
    count += len[0] + len[1];
  });
  if (count < 1000) return count;
  return Math.round(count / 100) / 10 + 'k';
});
