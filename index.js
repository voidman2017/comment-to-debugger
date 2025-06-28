const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

function removeDebugCode(sourceCode) {
  const options = this.getOptions() || {};
  
  if (options.enabled === false) {
    return sourceCode;
  }

  try {
    const ast = parser.parse(sourceCode, {
      sourceType: 'module',
      comments: true,
      plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties']
    });

    const getCommentValidator = () => {
      if (typeof options.validator === 'function') {
        return (comment) => options.validator(comment);
      }
      
      if (options.pattern) {
        const patterns = Array.isArray(options.pattern) ? options.pattern : [options.pattern];
        return (comment) => patterns.some(pattern => {
          if (pattern instanceof RegExp) {
            return pattern.test(comment.value.trim());
          }
          return false;
        });
      }
      
      return (comment) => comment.value.trim().includes('@debug');
    };

    const isValidComment = getCommentValidator();

    traverse(ast, {
      enter(path) {
        const leadingComments = path.node.leadingComments || [];
        const innerComments = path.node.innerComments || [];
        const comments = [...leadingComments, ...innerComments];
        
        const hasDebugComment = comments.some(isValidComment);

        if (hasDebugComment) {
          const debuggerStatement = t.debuggerStatement();
          path.insertBefore(debuggerStatement);
        }
      }
    });

    const output = generate(ast, {
      retainLines: true,
      comments: true,
      compact: false,
      jsescOption: {
        minimal: true
      },
      auxiliaryCommentBefore: '',
      auxiliaryCommentAfter: '',
      sourceMaps: true
    });

    return output.code
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\/\*\s*(.*?)\s*\*\/\s*debugger;/g, '/* $1 */\ndebugger;')
      .replace(/([;{])\s*debugger;/g, '$1\n  debugger;')
      .replace(/^(\s*)debugger;/gm, '  debugger;')
      .replace(/\s+$/gm, '')
      .replace(/\n+$/, '\n');
  } catch (error) {
    console.error('代码处理错误:', {
      message: error.message,
      location: error.loc,
      stack: error.stack
    });
    return sourceCode;
  }
}

// 为Vite创建插件
function createVitePlugin(options = {}) {
  return {
    name: 'vite-plugin-comment-debugger',
    enforce: 'pre',
    transform(code, id) {
      // 可以根据文件类型进行过滤
      if (!/\.(js|jsx|ts|tsx|vue)$/.test(id)) {
        return;
      }
      
      // 复用现有的removeDebugCode逻辑
      return removeDebugCode.call({ getOptions: () => options }, code);
    }
  };
}

// 修改导出，支持both Webpack和Vite
module.exports = function(sourceCode) {
  // 当作为Webpack loader使用时
  if (this && typeof this.getOptions === 'function') {
    return removeDebugCode.call(this, sourceCode);
  }
  // 当直接调用时（用于创建Vite插件）
  return createVitePlugin(sourceCode);
};

// 导出Vite插件创建函数
module.exports.vite = createVitePlugin;