# StillAlive 前端

这是 StillAlive 项目的前端部分，基于 React 18 和 TypeScript 开发。完整的项目文档请参考[后端仓库](https://github.com/Yao-lin101/StillAlive)。

## 技术栈

- React 18
- TypeScript
- TailwindCSS
- shadcn/ui

## 本地开发

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置以下必要参数：
```env
VITE_API_BASE_URL=http://localhost:8000  # 后端API地址
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── components/         # 通用组件
│   ├── ui/            # UI组件库
│   └── characters/    # 角色相关组件
├── hooks/             # 自定义Hooks
├── lib/               # 工具函数和常量
├── pages/            # 页面组件
└── services/         # API服务
```

## 开发指南

### 新增状态类型

1. 在 `src/types/status.ts` 中定义新的状态类型
2. 在 `src/components/characters/components/cards/` 下创建对应的状态卡片组件
3. 在 `src/components/characters/StatusList.tsx` 中注册新的状态类型

### 主题定制

1. 修改 `tailwind.config.js` 配置主题颜色
2. 在 `src/styles/themes/` 下添加新的主题样式
3. 在 `src/components/ThemeProvider.tsx` 中注册新主题

## 更多信息

- [完整项目文档](https://github.com/Yao-lin101/StillAlive/blob/master/README.md)
- [API文档](https://github.com/Yao-lin101/StillAlive/blob/master/README.md#状态同步-api)
- [部署指南](https://github.com/Yao-lin101/StillAlive/blob/master/README.md#部署)

## 相关仓库

- [StillAlive 后端](https://github.com/Yao-lin101/StillAlive) - 后端服务
- [StillAlive 客户端](https://github.com/Yao-lin101/stillalive-client) - 桌面客户端
