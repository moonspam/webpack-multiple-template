const path = require('path');
const fs = require('fs');
const glob = require('glob');

const sourcePath = './public/src/';
const outputPath = './public/dist/';

// lib, font 폴더 유무 체크
const copyStateLibs = fs.existsSync('./public/src/libs') && fs.lstatSync('./public/src/libs').isDirectory();
const copyStateFont = fs.existsSync('./public/src/font') && fs.lstatSync('./public/src/font').isDirectory();
console.log(`CopyWebpackPlugin(libs) : ${copyStateLibs}`);
console.log(`CopyWebpackPlugin(font) : ${copyStateFont}`);

// 패키지 모음
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlBeautifyPlugin = require('@nurminen/html-beautify-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

// 사이트 기본 정보
const site = require('./_site');

// html 생성 정보 초기화
const siteEntry = {};
const chunkNames = [];
const htmlList = [];

// html 개수에 따라 HtmlWebpackPlugin 호출
function generateHtmlPlugins(templateFiles, chunkName, index) {
  // 예외처리할 entry 리스트 추출
  var excludeChunkName = chunkNames.filter((chunk) => chunk !== chunkName);

  return templateFiles.map((file) => new HtmlWebpackPlugin({
    template: `./${file}`,
    filename: `${file}`,
    minify: false,
    hash: false,
    inject: false,
    chunks: chunkName,
    excludeChunks: excludeChunkName,
    title: site.pageInfo[index].title,
    meta: {
      charset: { charset: 'UTF-8' },
      'X-UA-Compatible': { 'http-equiv': 'X-UA-Compatible', content: 'ie=edge' },
      'format-detection': 'telephone=no',
      viewport: 'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no',
      keywords: site.pageInfo[index].keywords,
      description: site.pageInfo[index].description,
      'og:locale': { property: 'og:locale', content: 'ko_KR' },
      'og:type': { property: 'og:type', content: 'website' },
      'og:title': { property: 'og:title', content: site.pageInfo[index].title },
      'og:description': { property: 'og:description', content: site.pageInfo[index].description },
      'og:image:type': { property: 'og:image:type', content: 'image/jpeg' },
      'og:image:width': { property: 'og:image:width', content: '1200' },
      'og:image:height': { property: 'og:image:height', content: '630' },
      'og:image:alt': { property: 'og:image:alt', content: '' },
    },
  }));
}

module.exports = (env, argv) => {
  // Webpack 플러그인
  const plugins = [
    new ESLintPlugin(),
    new VueLoaderPlugin(),
    new CleanWebpackPlugin({
      protectWebpackAssets: false,
    }),
    new MiniCssExtractPlugin({
      filename: (e) => {
        // page/년도/날짜_이벤트명/css/style.css 처리
        const n = e.chunk.name.split('_');
        const d = `${n[0]}/${n[1]}_${n[2]}`;
        return `page/${d}/css/style.css`;
      },
    }),
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode: argv.mode === 'development' ? 'disabled' : 'static',
    }),
  ];

  // '사이트 기본 정보' 수 만큼 'html 생성 정보' 입력 + generateHtmlPlugins 실행
  site.pageInfo.map((s) => {
    const ey = s.eventYear;
    const ed = s.eventDate;
    const en = s.eventName;
    const entryName = `${ey}_${ed}_${en}`;
    const folderName = `${ey}/${ed}_${en}`;
    const siteEntryImport = {
      import: argv.mode === 'development' ? [`./page/${folderName}/css/development.scss`, `./page/${folderName}/css/style.scss`, `./page/${folderName}/js/ui.js`] : [`./page/${folderName}/css/style.scss`, `./page/${folderName}/js/ui.js`],
      filename: `page/${entryName}/js/ui.js`,
      publicPath: `./page/${entryName}/`,
    };
    siteEntry[entryName] = siteEntryImport;
    return chunkNames.push(entryName);
  });
  console.log('\n📋 HTML List');
  site.pageInfo.map((s, index) => {
    const ey = s.eventYear;
    const ed = s.eventDate;
    const en = s.eventName;
    const entryName = `${ey}_${ed}_${en}`;
    const folderName = `${ey}/${ed}_${en}`;
    // event 폴더 내 html 추출(include용 html은 예외처리)
    var templateFiles = glob.sync(`${sourcePath}page/${folderName}/**/*.html`, { dot: true, ignore: [`${sourcePath}page/${folderName}/**/_api/*.html`, `${sourcePath}page/${folderName}/**/_template/*.html`, `${sourcePath}/libs/**/*.html`, `${sourcePath}/font/**/*.html`] }).map((file) => file.replace(sourcePath, ''));
    console.log(templateFiles);
    const thisHtmlList = generateHtmlPlugins(templateFiles, entryName, index);
    return thisHtmlList.map((e) => htmlList.push(e));
  });

  // HtmlWebpackPlugin 확장 플러그인
  const htmlPlugins = [
    // 최초 진입 index.html 설정
    new HtmlWebpackPlugin({
      inject: false,
      excludeChunks: chunkNames,
      title: 'Webpack 이벤트 리스트',
      templateContent: ({ htmlWebpackPlugin }) => `
        <html>
          <head>
            <title>${htmlWebpackPlugin.options.title}</title>
            <link rel="icon" href="/libs/img/favicon.png">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css">
          </head>
          <body class="bg-dark bg-gradient">
            <div class="pb-5" style="margin: 0 auto;width: 540px">
              <h1 class="pt-5 text-white" style="text-shadow: 1px 1px 8px rgba(0, 0, 0, 0.8)"><i class="bi bi-explicit-fill"></i> ${htmlWebpackPlugin.options.title}</h1>
              <table class="table table-sm table-bordered table-hover mt-3 shadow" style="background-color: rgba(255, 255, 255, 0.8);backdrop-filter: blur(10px);">
                <colgroup>
                  <col style="width: 80px">
                  <col style="width: 80px">
                  <col style="width: auto">
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" colspan="2"><i class="bi bi-calendar3"></i> Date</th>
                    <th scope="col">Title</th>
                  </tr>
                </thead>
                <tbody>
                  ${site.pageInfo.slice(0).reverse().map((s, index, arr) => (index + 1 > (arr.length - 3) ? `<tr class="table-secondary text-black-50" style="cursor: pointer" onclick="window.open('/page/${s.eventYear}/${s.eventDate}_${s.eventName}/index.html')"><td>${s.eventYear}</td><td>${s.eventDate}</td><td>${s.title}</td></tr>` : `<tr style="cursor: pointer" onclick="window.open('/page/${s.eventYear}/${s.eventDate}_${s.eventName}/index.html')"><td>${s.eventYear}</td><td>${s.eventDate}</td><td>${s.title}</td></tr>`)).join('')}
                </tbody>
              </tabe>
            </div>
          </body>
        </html>
      `,
    }),
    new HtmlBeautifyPlugin({
      config: {
        html: {
          indent_size: 2,
          unformatted: ['p', 'i', 'b', 'span'],
        },
      },
    }),
  ];

  // lib, font 폴더 복사
  function copyPlugin() {
    let val = [];
    if (copyStateLibs && !copyStateFont) {
      val = [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: './libs/**/*',
            },
          ],
        }),
      ];
    }
    if (!copyStateLibs && copyStateFont) {
      val = [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: './font/**/*',
            },
          ],
        }),
      ];
    }
    if (copyStateLibs && copyStateFont) {
      val = [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: './libs/**/*',
            },
            {
              from: './font/**/*',
            },
          ],
        }),
      ];
    }
    return val;
  }

  console.log('\n********************************************************************************');
  console.log(`🚀 Build Mode: ${argv.mode}`);
  console.log('********************************************************************************\n');

  return {
    context: path.resolve(__dirname, sourcePath),
    entry: siteEntry,
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, outputPath),
      publicPath: '/',
    },
    target: ['web', 'es5'],
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
      },
      extensions: ['*', '.js', '.vue', '.json'],
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, sourcePath),
        watch: true,
      },
      open: true,
    },
    stats: {
      preset: 'errors-only',
      builtAt: true,
      timings: true,
      version: true,
    },
    mode: argv.mode === 'development' ? 'development' : 'production',
    devtool: argv.mode === 'development' ? 'source-map' : false,
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/](core-js|regenerator-runtime)[\\/]/,
            name: 'page/vendors/common.bundle',
            chunks: 'all',
          },
          vue: {
            test: /[\\/]node_modules[\\/](@vue|vue|vue-loader)[\\/]/,
            name: 'page/vendors/vue.bundle',
            chunks: 'all',
          },
          gsap: {
            test: /[\\/]node_modules[\\/](gsap)[\\/]/,
            name: 'page/vendors/gsap.bundle',
            chunks: 'all',
          },
        },
      },
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },
    performance: {
      hints: argv.mode === 'production' ? 'warning' : false,
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '/',
              },
            },
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                // eslint-disable-next-line global-require
                implementation: require('sass'),
              },
            },
          ],
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          include: /img/,
          type: 'asset/resource',
          generator: {
            filename: argv.mode === 'development' ? '[path][name][ext]' : '[path][name][ext]?[hash]',
          },
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            configFile: './.babelrc',
          },
        },
      ],
    },
    plugins: plugins.concat(copyPlugin()).concat(htmlList).concat(htmlPlugins),
  };
};
