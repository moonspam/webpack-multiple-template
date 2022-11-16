# webpack multiple template

webpack.js 다중 템플릿입니다.  
한 프로젝트 내 여러 종류의 페이지를 구성할 때 유용하게 작업할 수 있게 구성하였습니다.

# 폴더 구조

```txt
webpack-multiple-template
│   _site.js                  // 하위 페이지 정보 추가 + 폴더 생성 필요
│   webpack.config.js         // 웹팩 설정
└───public
    └───src                   // 작업용 폴더
    │   └───libs              // 복사만 되는 폴더 (하위 폴더는 아무렇게 생성 가능)
    │   │   └───img
    │   │   │   favicon.png
    │   │   └───js
    │   │       favicon.png
    │   │       test.js
    │   └───font              // 복사만 되는 폴더 (웹폰트)
    │   └───page
    │       └───2000                // _site.js 에서 설정한 년도 생성
    │           └───0101_html       // 월일_프로젝트 명
    │               │   index.html  // 필수 파일 (나머지는 자유롭게)
    │               └───js
    │               │   ui.js       // 필수 파일 (나머지는 자유롭게)
    │               └───css
    │               │   style.scss  // 스타일시트 파일 (선택)
    │               └───img
    └───dist                        // 배포용 폴더
        └───libs              // 작업용 폴더에 해당 폴더가 있음 그대로 복사
        └───font              // 위와 동일 조건
        └───page
            └───2000                // _site.js 에서 설정한 년도 생성
                └───0101_html       // 월일_프로젝트 명
                    │   index.html
                    └───js
                    │   ui.js       // 스크립트 번들 묶음 
                    └───css
                    │   style.css   // 스타일 번들 묶음 
                    └───img
```
