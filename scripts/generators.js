/**
 * Halcyon Theme — generators.js
 * Register custom generators for categories and tags index pages
 */

hexo.extend.generator.register('halcyon_pages', function (locals) {
  var config = hexo.config;

  return [
    {
      path: config.category_dir + '/index.html',
      data: { type: 'categories' },
      layout: ['categories']
    },
    {
      path: config.tag_dir + '/index.html',
      data: { type: 'tags' },
      layout: ['tags']
    }
  ];
});
