import {
    RoundedBox,
    Text,
} from '@react-three/drei'


export const SEAT_STOCK_POSITION = [
    58,
    0,
    22,
] as const


export function CarSeat({
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
            <RoundedBox
                args={[
                    0.72,
                    0.22,
                    0.72,
                ]}
                radius={0.08}
                smoothness={2}
                position={[
                    0,
                    0.42,
                    0,
                ]}
            >
                <meshStandardMaterial
                    color="#676d6a"
                    roughness={0.72}
                />
            </RoundedBox>

            <RoundedBox
                args={[
                    0.72,
                    0.94,
                    0.2,
                ]}
                radius={0.09}
                smoothness={2}
                position={[
                    0,
                    0.93,
                    -0.28,
                ]}
                rotation-x={
                    -0.12
                }
            >
                <meshStandardMaterial
                    color="#626865"
                    roughness={0.72}
                />
            </RoundedBox>

            <RoundedBox
                args={[
                    0.42,
                    0.28,
                    0.16,
                ]}
                radius={0.07}
                smoothness={2}
                position={[
                    0,
                    1.55,
                    -0.31,
                ]}
            >
                <meshStandardMaterial
                    color="#555b58"
                    roughness={0.7}
                />
            </RoundedBox>

            {[
                -0.25,
                0.25,
            ].map(
                (x) => (
                    <mesh
                        key={x}
                        position={[
                            x,
                            0.18,
                            0,
                        ]}
                    >
                        <boxGeometry
                            args={[
                                0.07,
                                0.3,
                                0.58,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#3d4340"
                            metalness={0.38}
                            roughness={0.48}
                        />
                    </mesh>
                ),
            )}
        </group>
    )
}


function SeatRack({
    position,
}: {
    position: [
        number,
        number,
        number,
    ]
}) {
    return (
        <group
            position={position}
            scale={1.16}
        >
            {[
                -1.15,
                1.15,
            ].map(
                (x) => (
                    <mesh
                        key={x}
                        position={[
                            x,
                            1.25,
                            0,
                        ]}
                    >
                        <boxGeometry
                            args={[
                                0.1,
                                2.5,
                                1.55,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#4a504c"
                            metalness={0.48}
                            roughness={0.44}
                        />
                    </mesh>
                ),
            )}

            {[
                0.15,
                1.35,
                2.45,
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
                                2.4,
                                0.09,
                                1.5,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#555b57"
                            metalness={0.42}
                            roughness={0.46}
                        />
                    </mesh>
                ),
            )}

            <CarSeat
                position={[
                    -0.58,
                    0.18,
                    0,
                ]}
            />

            <CarSeat
                position={[
                    0.58,
                    0.18,
                    0,
                ]}
            />

            <CarSeat
                position={[
                    -0.58,
                    1.38,
                    0,
                ]}
            />

            <CarSeat
                position={[
                    0.58,
                    1.38,
                    0,
                ]}
            />
        </group>
    )
}


export function SeatStockArea() {
    return (
        <group
            position={
                SEAT_STOCK_POSITION
            }
        >
            <SeatRack
                position={[
                    -1.6,
                    0,
                    1.9,
                ]}
            />

            <SeatRack
                position={[
                    1.6,
                    0,
                    1.9,
                ]}
            />

            <mesh
                position={[
                    0,
                    0.04,
                    4.2,
                ]}
            >
                <boxGeometry
                    args={[
                        7.2,
                        0.02,
                        1.05,
                    ]}
                />

                <meshStandardMaterial
                    color="#343a37"
                    roughness={0.8}
                />
            </mesh>

            <Text
                position={[
                    0,
                    0.07,
                    4.2,
                ]}
                rotation={[
                    -Math.PI / 2,
                    0,
                    0,
                ]}
                fontSize={0.66}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
            >
                STOCK SIÈGES
            </Text>

            {[
                -3.25,
                3.25,
            ].map(
                (x) => (
                    <mesh
                        key={x}
                        position={[
                            x,
                            0.48,
                            0.5,
                        ]}
                    >
                        <cylinderGeometry
                            args={[
                                0.09,
                                0.09,
                                0.96,
                                10,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#c69b24"
                            roughness={0.72}
                        />
                    </mesh>
                ),
            )}
        </group>
    )
}