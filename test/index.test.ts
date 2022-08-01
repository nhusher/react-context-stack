require('jsdom-global')();

import {createElement, ReactNode} from "react";
import { renderHook, screen, cleanup } from '@testing-library/react'
import { createContextStack } from "../src";
import { deepStrictEqual } from "assert";


describe('createContextStack', () => {
  const { useStack, Stack } = createContextStack<number>();

  afterEach(() => cleanup());

  describe('useStack', () => {
    it('should produce an empty array if no stack is created yet', () => {
      const { result } = renderHook(() => useStack());
      deepStrictEqual(result.current, []);
    });

    it('should produce an array of items representing the stack', () => {
      const stack = (id: number, children: ReactNode) =>
        createElement(Stack, { value: id, children })

      const { result } = renderHook(() => useStack(), {
        wrapper({ children }) {
          return stack(0, stack(1, stack(5, stack(3, children))));
        }
      });

      deepStrictEqual(result.current, [0, 1, 5, 3]);
    })
  })
});