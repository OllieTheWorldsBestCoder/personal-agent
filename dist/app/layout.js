"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
exports.metadata = {
    title: 'Personal AI Agent',
    description: 'Your personal AI assistant for email management and news updates',
};
function RootLayout({ children, }) {
    return (<html lang="en">
      <body>{children}</body>
    </html>);
}
//# sourceMappingURL=layout.js.map