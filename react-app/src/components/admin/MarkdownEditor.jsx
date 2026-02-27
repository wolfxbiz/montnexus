import MDEditor from '@uiw/react-md-editor';

export default function MarkdownEditor({ value, onChange }) {
  return (
    <div data-color-mode="dark" style={{ width: '100%' }}>
      <MDEditor
        value={value}
        onChange={onChange}
        height={500}
        preview="edit"
        style={{
          background: '#111',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
    </div>
  );
}
