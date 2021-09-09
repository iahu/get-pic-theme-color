# 获取图片主题色

过程说明：

将图片缩小到 `40px * 40px` 左右
对缩小的图片运用高斯模糊，使得小图像素糊成一团，基本上只有一个主色调
取四个角与中心点，求其平均值，产出一个较合理的主题色值

## 使用方法

示例

```sh
y build &&  node ./dist/cli.js '~/icons/*.webp'
```
