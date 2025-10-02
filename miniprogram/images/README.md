# 图片资源目录

此目录用于存放小程序所需的图片资源。

## 当前状态

项目使用自定义tabBar组件，但为了通过微信小程序的配置验证，保留了图片路径配置。

## 文件说明

- `tab-chart.png` / `tab-chart-active.png` - 数据页标签图标
- `tab-list.png` / `tab-list-active.png` - 记录页标签图标
- `tab-user.png` / `tab-user-active.png` - 个人中心标签图标

## 实际实现

项目实际使用自定义tabBar组件 (`custom-tab-bar/`) 和微信小程序内置图标字体，这些图片文件只是占位符用于通过配置验证。

## 如需使用真实图标

1. 替换这些PNG文件为真实的图标
2. 图标建议尺寸：40x40 像素
3. 确保选中状态和未选中状态图标风格一致