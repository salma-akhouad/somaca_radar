import {
    RoundedBox,
} from '@react-three/drei'

import {
    VEHICLE_JOURNEY,
} from './data/vehicleJourney'

export function LoweringStation() {
    const lowered = VEHICLE_JOURNEY.lowered
    return (
        <group
            position={[
                lowered.position[0],
                0,
                lowered.position[2],
            ]}
        >
            <RoundedBox
                args={[
                    3.6,
                    0.14,
                    0.22,
                ]}
                radius={0.04}
                smoothness={2}
                position={[
                    0,
                    4.35,
                    0,
                ]}
                castShadow
            >
                <meshStandardMaterial
                    color="#3b413d"
                    metalness={0.58}
                    roughness={0.36}
                />
            </RoundedBox>

            {[-1.35, 1.35].map(
                (x) => (
                    <mesh
                        key={x}
                        position={[
                            x,
                            2.2,
                            0,
                        ]}
                        castShadow
                    >
                        <boxGeometry
                            args={[
                                0.12,
                                4.4,
                                0.12,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#4a504c"
                            metalness={0.48}
                            roughness={0.42}
                        />
                    </mesh>
                ),
            )}

            {[-0.78, 0.78].map(
                (z) => (
                    <mesh
                        key={z}
                        position={[
                            0,
                            3,
                            z,
                        ]}
                    >
                        <cylinderGeometry
                            args={[
                                0.035,
                                0.035,
                                2.6,
                                10,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#343936"
                            metalness={0.44}
                            roughness={0.43}
                        />
                    </mesh>
                ),
            )}

            <RoundedBox
                args={[
                    3,
                    0.12,
                    1.7,
                ]}
                radius={0.04}
                smoothness={2}
                position={[
                    0,
                    1.72,
                    0,
                ]}
                castShadow
            >
                <meshStandardMaterial
                    color="#373d39"
                    metalness={0.5}
                    roughness={0.4}
                />
            </RoundedBox>

            {[-1.1, 1.1].map(
                (x) => (
                    <mesh
                        key={x}
                        position={[
                            x,
                            0.055,
                            0,
                        ]}
                    >
                        <boxGeometry
                            args={[
                                0.12,
                                0.025,
                                2.05,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#747974"
                            metalness={0.14}
                            roughness={0.7}
                        />
                    </mesh>
                ),
            )}
        </group>
    )
}