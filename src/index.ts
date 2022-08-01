import {
  createContext,
  createElement,
  ReactElement,
  ReactNode,
  useContext,
  useDebugValue,
  useMemo,
} from "react";

interface StackContextValue<T> {
  parent: null | StackContextValue<T>;
  value: T;
}

interface StackProps<T> {
  value: T;
  children: ReactNode;
}

interface StackInterface<T> {
  useStack: () => T[];
  Stack: (props: StackProps<T>) => ReactElement;
}

/**
 * A general-purpose utility for defining sparse stacks of React components.
 *
 * This function is a constructor that lets you create any sort of component
 * stack information and will return an object of two properties:
 *
 * - Stack - a wrapper around a context provider that introduces a new item
 *    to the context stack.
 * - useStack - a hook for returning an array of stack items, from root-most
 *    to leaf-most added elements.
 *
 * @example
 *
 * Let's say we want to keep track of the section identifier of headings in
 * a legal document. So the third paragraph under the second section under
 * the fourth subheading under the first heading might be given the id of
 * "1.4.2.3" so that people could link directly to that:
 *
 * - "1" the first heading
 * - "4" the fourth subheading
 * - "2" the second section
 * - "3" the third paragraph
 *
 * We can either track this by hand when writing the components or pass along
 * section metadata via props, but this will quickly become tedious. Instead,
 * we can use a context-based stack:
 *
 * const { useStack, Stack } = createContextStack();
 *
 * function Section({ children, index, title }) {
 *   return <Stack value={index}>
 *     {title}
 *     {children}
 *   </Stack>
 * }
 *
 * function Paragraph({ children, index }) {
 *   const stack = useStack();
 *
 *   return <p id={'link-' + stack.concat(index).join('.')}>
 * }
 *
 * <Section title="First heading" index={1}>
 *   ...
 *   <Section title="Fourth subheading' index={4}>
 *     ...
 *     <Section title="Second section" index={2}>
 *       ...
 *       <Paragraph index={3}>Hello, I should have the id "link-1.4.2.3"</Paragraph>
 **/
export function createContextStack<T>(): StackInterface<T> {
  const context = createContext<null | StackContextValue<T>>(null);

  /**
   * Add a new item to the context stack.
   *
   * @param value
   * @param children
   * @constructor
   */
  function Stack({ value, children }: StackProps<T>) {
    const parent = useContext(context);

    const val = useMemo(
      () => ({
        parent,
        value,
      }),
      [value, parent]
    );

    return createElement(context.Provider, { value: val }, children);
  }

  /**
   * Return an array of items in the stack, or an empty array if no stack has
   * been established yet.
   */
  function useStack() {
    const stackContextValue = useContext(context);

    const stack = useMemo(() => {
      const s = [];

      // Walk up the stack and get just the values out of it. If we hit null,
      // we know we are at the root node that has no parents. Using a for loop
      // here instead of recursion, but recursion would also work fine.
      for (let p = stackContextValue; p !== null; p = p.parent)
        s.unshift(p.value);

      return s;
    }, [stackContextValue]);

    useDebugValue(stack);
    return stack;
  }

  return {
    useStack,
    Stack,
  };
}