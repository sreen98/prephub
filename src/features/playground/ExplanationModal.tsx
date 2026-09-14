import type { AnyExplanation } from '../../data/playground/playgroundExplanations';
import { isBuildExplanation } from '../../data/playground/explanationKind';
import AlgorithmExplanationModal from './AlgorithmExplanationModal';
import BuildExplanationModal from './BuildExplanationModal';

interface Props {
  open: boolean;
  explanation: AnyExplanation | null;
  /** The canonical template body, so build steps can quote it rather than restate it. */
  templateCode?: string;
  onClose: () => void;
  /** Loads a polyfill template by name. Called when the user clicks a polyfill chip. */
  onLoadTemplate?: (templateName: string) => void;
}

/**
 * Picks the walkthrough that fits the content.
 *
 * A coding challenge gets the algorithm stepper — approaches, pseudocode, and a
 * data structure animated frame by frame. A machine-coding template gets the
 * build-order walkthrough, because it has no Big-O to compare and no array to
 * step through; forcing it into the stepper is why the React templates shipped
 * with no Explain button at all.
 *
 * Kept as a thin dispatcher so neither body carries the other's branches — and
 * so `ExplanationModal` itself stays under the complexity limit.
 */
export default function ExplanationModal({ open, explanation, templateCode, onClose, onLoadTemplate }: Props) {
  if (!explanation) return null;
  return isBuildExplanation(explanation)
    ? <BuildExplanationModal open={open} explanation={explanation} templateCode={templateCode} onClose={onClose} />
    : <AlgorithmExplanationModal open={open} explanation={explanation} onClose={onClose} onLoadTemplate={onLoadTemplate} />;
}
