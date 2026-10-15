// Type shim to fix React 19 + React Native 0.86 JSX compatibility.
// All RN class-based components lose Component<P,S> properties through
// the Constructor<HostInstance> intersection in React 19's stricter JSX checks.
// Patching JSX.ElementClass to accept any object is the minimal fix.
import React from 'react';

declare global {
  namespace JSX {
    interface ElementClass {
      context?: unknown;
      setState?: (...args: any[]) => void;
      forceUpdate?: (...args: any[]) => void;
      render?(): React.ReactNode;
      props?: any;
      state?: any;
      refs?: any;
    }
  }
}
