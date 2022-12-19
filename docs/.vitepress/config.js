module.exports = {
  title: 'study-element-plus',
  description: 'el-stydy UI',
  base: '/',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/element-plus-logo-small.svg',
        type: 'image/svg+xm'
      }
    ]
  ],
  themeConfig: {
    docsDir: 'docs',
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/installation', activeMatch: '/guide/' },
      { text: '组件', link: '/component/icon', activeMatch: '/component/' },
      { text: 'github站点', link: '/', target: '_blank' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/quieStart' }
          ]
        }
      ],
      '/component/': [
        {
          text: '基础组件',
          items: [
            { text: 'Icon', link: '/component/icon' },
            { text: 'Button', link: '/component/button' }
          ]
        }
      ]
    }
  }
};
