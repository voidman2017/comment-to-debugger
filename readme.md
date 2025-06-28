# comment-to-debugger

一个用于将特定注释转换为 `debugger` 语句的 webpack loader 和 vite 插件，让调试更加便捷。

## 功能特性

- 🔧 支持 Webpack 和 Vite
- 🎯 将特定注释（如 `@debug`）转换为 `debugger` 语句
- 🔍 支持自定义注释模式和验证器
- 📝 保持代码格式和注释
- ⚡ 支持 JavaScript、TypeScript、JSX、Vue 等文件类型
- 🛡️ 错误处理机制，确保构建稳定性

## 安装

```bash
npm install comment-to-debugger --save-dev
# 或
yarn add comment-to-debugger --dev
# 或
pnpm add comment-to-debugger --save-dev
```

## 使用方法

### Webpack 配置

在你的 `webpack.config.js` 中添加 loader：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          {
            loader: 'comment-to-debugger',
            options: {
              enabled: true, // 是否启用，默认 true
              pattern: [/@debug/], // 匹配模式
            }
          }
        ],
        enforce: 'pre'
      }
    ]
  }
};
```

### Vite 配置

在你的 `vite.config.js` 中添加插件：

```javascript
import { defineConfig } from 'vite';
import commentToDebugger from 'comment-to-debugger';

export default defineConfig({
  plugins: [
    commentToDebugger.vite({
      enabled: true,
      pattern: [/@debug/]
    })
  ]
});
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用转换功能 |
| `pattern` | `RegExp[]` | `[/@debug/]` | 匹配注释的正则表达式数组 |
| `validator` | `function` | `undefined` | 自定义验证函数，接收注释对象作为参数 |

## 使用示例

### 基础用法

```javascript
// 原始代码
function calculateSum(a, b) {
  // @debug
  const result = a + b;
  return result;
}
```

转换后：

```javascript
function calculateSum(a, b) {
  // @debug
  debugger;
  const result = a + b;
  return result;
}
```

### 自定义模式

```javascript
// webpack.config.js
{
  loader: 'comment-to-debugger',
  options: {
    pattern: [/@breakpoint/, /DEBUG_HERE/]
  }
}
```

```javascript
// 代码中使用
function processData(data) {
  // @breakpoint
  const processed = data.map(item => item * 2);
  
  // DEBUG_HERE
  return processed;
}
```

### 自定义验证器

```javascript
// webpack.config.js
{
  loader: 'comment-to-debugger',
  options: {
    validator: (comment) => {
      return comment.value.includes('STOP') && 
             comment.value.includes('HERE');
    }
  }
}
```

```javascript
// 代码中使用
function complexFunction() {
  // STOP HERE for inspection
  const data = fetchData();
  return data;
}
```

## 支持的文件类型

- JavaScript (`.js`)
- TypeScript (`.ts`)
- JSX (`.jsx`)
- TSX (`.tsx`)
- Vue (`.vue`)

## 注意事项

1. **生产环境**: 建议只在开发环境中启用此功能
2. **性能**: 该工具会解析和转换代码，可能会略微影响构建速度
3. **调试**: 转换后的 `debugger` 语句会在浏览器开发者工具中触发断点
4. **兼容性**: 支持现代 JavaScript 语法和 TypeScript

## 开发环境配置示例

```javascript
// webpack.config.js
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          {
            loader: 'comment-to-debugger',
            options: {
              enabled: isDevelopment
            }
          }
        ],
        enforce: 'pre'
      }
    ]
  }
};
```

## 错误处理

如果代码解析失败，插件会：
- 输出详细的错误信息到控制台
- 返回原始代码，确保构建不会中断
- 提供错误位置信息便于调试

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### 1.0.2
- 支持 Vite 插件
- 改进代码格式化
- 增强错误处理

### 1.0.1
- 初始版本
- 支持 Webpack loader
- 基础注释转换功能