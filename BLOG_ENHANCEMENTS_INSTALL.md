# Blog Enhancements - Installation Instructions

## Required npm Packages

Run these commands to install the necessary packages for blog enhancements:

```bash
# For Rich Text Editor (Enhancement #1)
npm install react-quill
npm install --save-dev @types/react-quill

# For Image Processing (Enhancement #2)
npm install @supabase/storage-js
npm install react-dropzone

# For Markdown Support (optional, for content flexibility)
npm install react-markdown remark-gfm

# For Syntax Highlighting in blog posts (optional)
npm install react-syntax-highlighter
npm install --save-dev @types/react-syntax-highlighter
```

## Quill Editor Styles

The Quill editor requires CSS. Add to your main CSS file or import in components:

```css
/* Import Quill styles */
@import 'react-quill/dist/quill.snow.css';
```

Or import in your component:
```typescript
import 'react-quill/dist/quill.snow.css';
```

## After Installing

1. Run `npm install` to install all packages
2. Restart your development server
3. The blog admin will now have rich text editing capabilities

## Package Details

### react-quill
- **Purpose**: WYSIWYG rich text editor
- **Size**: ~80KB minified
- **Features**: Bold, italic, lists, links, images, code blocks
- **Docs**: https://github.com/zenoamaro/react-quill

### @supabase/storage-js
- **Purpose**: File upload to Supabase Storage
- **Features**: Upload, download, delete files
- **Docs**: https://supabase.com/docs/reference/javascript/storage

### react-dropzone
- **Purpose**: Drag-and-drop file uploads
- **Features**: File validation, preview, multiple files
- **Docs**: https://react-dropzone.js.org/

---

**Run this command to install everything at once:**

```bash
npm install react-quill @supabase/storage-js react-dropzone react-markdown remark-gfm react-syntax-highlighter && npm install --save-dev @types/react-quill @types/react-syntax-highlighter
```
