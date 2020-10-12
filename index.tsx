import * as React from 'react';
import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom';
import { animated } from 'react-spring';
import { a } from '@react-spring/three';
import { Primitive, New } from 'react-three-fiber/components'
// import {shaders} from './lib';
//import "ace-builds/src-noconflict/mode-glsl";
//import "ace-builds/src-noconflict/theme-github";

//import AceEditor from "react-ace";
import { Canvas, useFrame, useLoader, Dom } from 'react-three-fiber';
import { Text } from 'drei';
import * as THREE from 'three';
import { Controls, ControlsProvider, useControl, BaseControl, ControlType } from '../src';
import { useEffect } from 'react';
import { Vector2, Vector3 } from 'three';
import * as ACE from 'ace-builds/ace';

const Box = (props) => {
  //useEffect(() )
  const ref = React.useRef<THREE.Mesh>();

  // const bool2 = useControl('Boolean', { group: 'More', type: 'boolean', });
  const bool = useControl('Run', { 
       group: 'More', 
       type: ControlType.BUTTON,
      onClick: () => {
         (ref.current.material as THREE.Material).needsUpdate = true;
      }
     });
  const color = useControl('Color', { type: 'color', group: 'Basic', });

  const position = useControl('Position', {
    type: 'xypad',
    value: { x: 0, y: 0 },
    distance: 1,
  });

  const texture = useControl('Texture', {
    group: 'More',
    type: 'file',
    value: undefined,
    loader: new THREE.TextureLoader(),
  });

  const str = useControl('Text', {
    type: 'string',
    value: 'texture2D(texture1, uv*abs(sin(time)*4.)*2.).rgb',
    // value: 'vec3(sin(time), x2, 0.)',
  });
// TODO need this to recompile shader?
  useEffect(() => {
    if (ref.current) {
      (ref.current.material as THREE.Material).needsUpdate = true;
    }
  }, [texture, bool]);

  const mesh = new THREE.Mesh()
  const geometry = new THREE.SphereGeometry(1, 16, 16)
        // <boxGeometry attach="geometry" args={[1, 1, 1]} />
  //const geometry = new THREE.PlaneGeometry(1, 16, 16)
        // <Primitive object={mesh} geometry={geometry}/>
  return (
    <>
      <a.mesh
        ref={ref}
        position={[0, 0, 0]}
      >
        <planeGeometry attach="geometry" args={[1, 1, .01]}/>
        <ShaderMaterial     x2={position.x}
                            y2={position.y} 
                            startTime={Date.now()}
                            str={str} 
                            texture1={texture}
                            />
      </a.mesh>
      <Text fontSize={.3} color="black" font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff" >
        {str}
      </Text>
    </>
  );
};
// <a.meshPhongMaterial attach="material" map={texture} color={color} />
function ShaderMaterial(props) {
  const ref = React.useRef();
  const startTime = Date.now();
  const uniforms = React.useMemo(
    () =>
      THREE.UniformsUtils.merge([THREE.UniformsLib.lights, shaders.uniforms]),
    []
  );
  const frag = `
    uniform float x2;
    uniform float y2;
    uniform float time;
    uniform sampler2D texture1;
    uniform vec2 resolution;
    varying vec2 vUv;


    void main() {
      vec2 uv = gl_FragCoord.xy/resolution.xy;
      gl_FragColor = vec4(${props.str}, 1.0);
    }
  `
  useFrame(state => {
    //@ts-ignore
    ref.current.uniforms.x2.value = props.x2;
    //@ts-ignore
    ref.current.uniforms.y2.value = props.y2;
    // console.log(ref.current.uniforms.time.value)
    //@ts-ignore
    ref.current.uniforms.time.value += .03;
    // ref.current.uniforms.time.value = Date.now() - props.startTime;
  });
  return (
    <shaderMaterial
      ref={ref}
      attach="material"
      uniforms={uniforms}
      vertexShader={shaders.vertexShader}
      fragmentShader={frag}
      lights={true}
    />
  );
}

const App = () => {
  return (
    <ControlsProvider>
      <Canvas style={{ width: 800, height: 600 }}>
        <ambientLight intensity={1} />
        <pointLight position={[0, 2, 2]} />
        <React.Suspense fallback={null}>
          <Box />
        </React.Suspense>
      </Canvas>
      <Controls />
    </ControlsProvider>
  ); // <Hello /> was between canvas and controls
};

ReactDOM.render(<App />, document.getElementById('root'));
/*

export const Editor = () =>  { 
const onChange = (newValue) => console.log("change", newValue)
 return ReactDOM.render(
  <AceEditor mode="glsl" theme="github"
    onChange={onChange} name="UNIQUE_ID_OF_DIV"
    editorProps={{ $blockScrolling: true }} />,
  document.getElementById("editor"));
 }

    <Dom> <animated.div style={{ width: 180, background: 'orange', padding: 20 }}>
      <p>This is a div</p>
      <div> {props.text} </div>
    </animated.div>
    </Dom>*/
export const shaders = {
    uniforms: {
      x2: { type: "f", value: 0.0 },
      y2: { type: "f", value: 0.0 },
      time: { type: "f", value: 0.0 },
      texture1: { type: "t", value: null },
      resolution: { type: 'v2', value: new Vector2(200, 200) } 
      , color1: { type: 'v3', value: new Vector3(0) } 
      , color2: { type: 'v3', value: new Vector3(0) } 
    },
    vertexShader: `
    varying vec2 vUv;
  
      uniform float x2, y2;
      uniform float time;
      void main() 
      {
        vUv = uv;
  
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `
  };
  const unitypemap = { f: "float", t: "sampler2D", v2 : "vector2", v3: "vector3" }