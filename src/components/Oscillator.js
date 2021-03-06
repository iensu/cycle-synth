import {div, fieldset, legend } from '@cycle/dom';
import isolate from '@cycle/isolate';
import xs from 'xstream';
import { waveforms } from '../constants';
import LabeledSlider from './LabeledSlider';
import LabeledSelector from './LabeledSelector';

export default function Oscillator(sources) {
  const props$ = sources.props.remember();
  const Waveform = isolate(LabeledSelector);
  const Octave = isolate(LabeledSelector);
  const Gain = isolate(LabeledSlider);
  const Detune = isolate(LabeledSlider);

  const controls$ = props$
        .map(({ waveform, detune, gain, octave }) => [
          Waveform({
            DOM: sources.DOM,
            props: xs.of({ labeltext: 'Waveform', options: waveforms, value: waveform })
          }),
          Octave({
            DOM: sources.DOM,
            props: xs.of({ labeltext: 'Octave', options: [-2, -1, 0, 1, 2], value: octave })
          }),
          Gain({
            DOM: sources.DOM,
            props: xs.of({ labeltext: 'Gain', min: 0, max: 1, step: 0.01, value: gain })
          }),
          Detune({
            DOM: sources.DOM,
            props: xs.of({ labeltext: 'Detune', min: -100, max: 100, step: 1, value: detune })
          })
        ]);

  const value$ = controls$
        .map(controls => xs.combine(props$, ...controls.map(c => c.value)))
        .flatten()
        .map(([props, waveform, octave, gain, detune]) => ({
          label: props.label, waveform, gain, detune, octave: parseInt(octave)
        }))
        .remember();

  const vdom$ = controls$
        .map(controls => xs.combine(props$, ...controls.map(c => c.DOM)))
        .flatten()
        .map(([props, ...controlsVdom]) => (
          fieldset([
            legend('.label', props.label),
            div('.oscillator-controls', controlsVdom)
          ])
        ));

  return {
    DOM: vdom$,
    value: value$
  };
}
