import {
    RoundedBox,
    Text,
} from '@react-three/drei'

import {
    useRef,
} from 'react'

import {
    useFrame,
} from '@react-three/fiber'

import type {
    Group,
} from 'three'

import {
    getLogisticsState,
    LOGISTICS_PICKUP_POSITION,
} from './data/logisticsCycle'


function StockWheel({
    position,
    rotation = 0,
}: {
    position: [
        number,
        number,
        number,
    ]

    rotation?: number
}) {
    return (
        <group
            position={position}
            rotation-y={rotation}
        >
            <mesh
                rotation-x={
                    Math.PI / 2
                }
            >
                <cylinderGeometry
                    args={[
                        0.34,
                        0.34,
                        0.2,
                        18,
                    ]}
                />

                <meshStandardMaterial
                    color="#171b19"
                    roughness={0.8}
                />
            </mesh>

            <mesh
                rotation-x={
                    Math.PI / 2
                }
            >
                <cylinderGeometry
                    args={[
                        0.18,
                        0.18,
                        0.215,
                        14,
                    ]}
                />

                <meshStandardMaterial
                    color="#969d99"
                    metalness={0.65}
                    roughness={0.3}
                />
            </mesh>
        </group>
    )
}


function WheelRack({
    position,
}: {
    position: [
        number,
        number,
        number,
    ]
}) {
    return (
        <group position={position}>
            {[
                -1.1,
                1.1,
            ].map(
                (x) => (
                    <mesh
                        key={x}
                        position={[
                            x,
                            1.05,
                            0,
                        ]}
                    >
                        <boxGeometry
                            args={[
                                0.1,
                                2.1,
                                1.3,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#4b514d"
                            metalness={0.5}
                            roughness={0.42}
                        />
                    </mesh>
                ),
            )}

            {[
                0.35,
                1.05,
                1.75,
            ].map(
                (y) => (
                    <mesh
                        key={y}
                        position={[
                            0,
                            y,
                            0,
                        ]}
                    >
                        <boxGeometry
                            args={[
                                2.3,
                                0.09,
                                1.25,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#565c58"
                            metalness={0.42}
                            roughness={0.46}
                        />
                    </mesh>
                ),
            )}

            {[
                [-0.68, 0.63, -0.32],
                [0, 0.63, -0.32],
                [0.68, 0.63, -0.32],

                [-0.68, 1.33, 0.28],
                [0, 1.33, 0.28],
                [0.68, 1.33, 0.28],

                [-0.4, 2.02, -0.22],
                [0.4, 2.02, -0.22],
            ].map(
                (
                    [
                        x,
                        y,
                        z,
                    ],
                    index,
                ) => (
                    <StockWheel
                        key={index}
                        position={[
                            x,
                            y,
                            z,
                        ]}
                        rotation={
                            index % 2 === 0
                                ? 0.08
                                : -0.06
                        }
                    />
                ),
            )}
        </group>
    )
}


function StockOperator() {
    const root =
        useRef<Group>(null)

    const arm =
        useRef<Group>(null)

    const wheel =
        useRef<Group>(null)


    useFrame(
        (state) => {
            if (
                !root.current ||
                !arm.current ||
                !wheel.current
            ) {
                return
            }


            const logistics =
                getLogisticsState(
                    state.clock.elapsedTime,
                )


            root.current.position.set(
                0,
                0,
                0,
            )

            root.current.rotation.y = 0

            arm.current.rotation.x =
                -0.25

            wheel.current.visible =
                false


            if (
                logistics.phase !==
                'pickup' ||
                logistics.stockLoadProgress <=
                0
            ) {
                return
            }


            const progress =
                logistics.stockLoadProgress


            if (
                progress <
                0.35
            ) {
                /*
         * The operator faces the AGV loading
         * position while taking the wheel
         * from stock.
         *
         * Parent world rotation = PI / 2.
         */
                root.current.rotation.y =
                    -2.75

                arm.current.rotation.x =
                    -0.75

                wheel.current.visible =
                    true
            } else if (
                progress <
                0.75
            ) {
                root.current.position.x =
                    0.35

                root.current.rotation.y =
                    -2.55

                arm.current.rotation.x =
                    -0.95

                wheel.current.visible =
                    true
            } else {
                root.current.position.x =
                    0.45

                root.current.rotation.y =
                    -2.45

                arm.current.rotation.x =
                    -0.65

                wheel.current.visible =
                    false
            }
        },
    )


    return (
        <group
            position={[
                -37.6,
                0,
                27,
            ]}
            rotation-y={
                Math.PI / 2
            }
        >
            <group ref={root}>
                {[
                    -0.12,
                    0.12,
                ].map(
                    (x) => (
                        <mesh
                            key={x}
                            position={[
                                x,
                                0.48,
                                0,
                            ]}
                        >
                            <cylinderGeometry
                                args={[
                                    0.085,
                                    0.1,
                                    0.76,
                                    10,
                                ]}
                            />

                            <meshStandardMaterial
                                color="#414a46"
                            />
                        </mesh>
                    ),
                )}

                <RoundedBox
                    args={[
                        0.52,
                        0.72,
                        0.34,
                    ]}
                    radius={0.1}
                    smoothness={2}
                    position={[
                        0,
                        1.16,
                        0,
                    ]}
                >
                    <meshStandardMaterial
                        color="#d6aa27"
                        roughness={0.65}
                    />
                </RoundedBox>

                <group
                    ref={arm}
                    position={[
                        0.31,
                        1.35,
                        0,
                    ]}
                >
                    <mesh
                        position={[
                            0,
                            -0.25,
                            0,
                        ]}
                    >
                        <cylinderGeometry
                            args={[
                                0.07,
                                0.085,
                                0.5,
                                10,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#d6aa27"
                        />
                    </mesh>

                    <group
                        ref={wheel}
                        position={[
                            0,
                            -0.57,
                            0.12,
                        ]}
                        visible={false}
                    >
                        <StockWheel
                            position={[
                                0,
                                0,
                                0,
                            ]}
                        />
                    </group>
                </group>

                <mesh
                    position={[
                        0,
                        1.75,
                        0,
                    ]}
                >
                    <sphereGeometry
                        args={[
                            0.19,
                            12,
                            10,
                        ]}
                    />

                    <meshStandardMaterial
                        color="#c79073"
                    />
                </mesh>

                <mesh
                    position={[
                        0,
                        1.92,
                        0,
                    ]}
                    scale={[
                        1,
                        0.45,
                        1,
                    ]}
                >
                    <sphereGeometry
                        args={[
                            0.215,
                            12,
                            10,
                        ]}
                    />

                    <meshStandardMaterial
                        color="#e7ba31"
                    />
                </mesh>

                {[
                    -0.065,
                    0.065,
                ].map(
                    (x) => (
                        <mesh
                            key={x}
                            position={[
                                x,
                                1.77,
                                0.17,
                            ]}
                        >
                            <sphereGeometry
                                args={[
                                    0.018,
                                    6,
                                    6,
                                ]}
                            />

                            <meshStandardMaterial
                                color="#282b29"
                            />
                        </mesh>
                    ),
                )}
            </group>
        </group>
    )
}


export function WheelStockArea() {
    const [
        stockX,
        stockZ,
    ] =
        LOGISTICS_PICKUP_POSITION


    return (
        <group>
            <group
                position={[
                    stockX - 1.5,
                    0,
                    stockZ + 3,
                ]}
            >
                <WheelRack
                    position={[
                        0,
                        0,
                        0,
                    ]}
                />

                <WheelRack
                    position={[
                        3,
                        0,
                        0,
                    ]}
                />
            </group>


            {/* Physical rack protection */}

            {[
                -43.4,
                -36.4,
            ].map(
                (x) => (
                    <group
                        key={x}
                        position={[
                            x,
                            0,
                            31.7,
                        ]}
                    >
                        <mesh
                            position={[
                                0,
                                0.45,
                                0,
                            ]}
                        >
                            <cylinderGeometry
                                args={[
                                    0.09,
                                    0.09,
                                    0.9,
                                    10,
                                ]}
                            />

                            <meshStandardMaterial
                                color="#d0a52c"
                                roughness={0.68}
                            />
                        </mesh>

                        <mesh
                            position={[
                                0,
                                0.75,
                                0,
                            ]}
                        >
                            <cylinderGeometry
                                args={[
                                    0.095,
                                    0.095,
                                    0.9,
                                    10,
                                ]}
                            />

                            <meshStandardMaterial
                                color="#252a27"
                                roughness={0.7}
                            />
                        </mesh>
                    </group>
                ),
            )}


            <mesh
                position={[
                    -40,
                    0.04,
                    33.1,
                ]}
            >
                <boxGeometry
                    args={[
                        5.5,
                        0.02,
                        0.85,
                    ]}
                />

                <meshStandardMaterial
                    color="#343a37"
                    roughness={0.8}
                />
            </mesh>


            <Text
                position={[
                    -40,
                    0.07,
                    33.1,
                ]}
                rotation={[
                    -Math.PI / 2,
                    0,
                    0,
                ]}
                fontSize={0.5}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
            >
                STOCK ROUES
            </Text>


            {/* AGV loading box */}

            {[
                -1.25,
                1.25,
            ].map(
                (zOffset) => (
                    <mesh
                        key={zOffset}
                        position={[
                            stockX,
                            0.04,
                            stockZ +
                            zOffset,
                        ]}
                    >
                        <boxGeometry
                            args={[
                                4,
                                0.012,
                                0.065,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#caa02a"
                            roughness={0.76}
                        />
                    </mesh>
                ),
            )}


            <StockOperator />
        </group>
    )
}