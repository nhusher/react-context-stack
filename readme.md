# `create-context-stack`

A barebones tool for generating sparse document information from a React
tree  using context.

Let's say we want to keep track of the section identifier of headings in
a legal document. So the third paragraph under the second section under
the fourth subheading under the first heading might be given the id of
"1.4.2.3" so that people could link directly to that:

- "1" the first heading
- "4" the fourth subheading
- "2" the second section
- "3" the third paragraph

We can either track this by hand when writing the components or pass along
section metadata via props, but this will quickly become tedious. Instead,
we can use a context-based stack:

```jsx
const { useStack, Stack } = createContextStack();

function Section({ children, index, title }) {
  return <Stack value={index}>
    <heading>{title}</heading>
    {children}
  </Stack>
}

function Paragraph({ children, index }) {
  const stack = useStack();

  return <p id={'link-' + stack.concat(index).join('.')}>{children}</p>
}

// later:
<Section title="First heading" index={1}>
  ...
  <Section title="Fourth subheading" index={4}>
    ...
    <Section title="Second section" index={2}>
      ...
      <Paragraph index={3}>Hello, I should have the id "link-1.4.2.3"</Paragraph>
```