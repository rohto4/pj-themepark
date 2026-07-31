import { Component, type ReactNode } from 'react';

type SceneErrorBoundaryProps = {
  sceneKey: string;
  onEscape: () => void;
  children: ReactNode;
};

type SceneErrorBoundaryState = {
  hasError: boolean;
};

export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: Readonly<SceneErrorBoundaryProps>) {
    if (this.state.hasError && previousProps.sceneKey !== this.props.sceneKey) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="scene-fault__panel" role="alert" aria-labelledby="scene-fault-heading">
        <p className="scene-fault__eyebrow">A lantern has turned back toward the gate</p>
        <h2 id="scene-fault-heading">This path folded unexpectedly</h2>
        <p className="scene-fault__copy">
          The rest of the park is still awake. Return to the Morrowspire and choose another light.
        </p>
        <button className="scene-fault__escape" type="button" onClick={this.props.onEscape}>
          Return to the Morrowspire
        </button>
      </section>
    );
  }
}
