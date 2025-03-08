import { useCallback } from "react";
import { useEffect, useState } from "react";
import { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

const FEATHER_SOURCES = [
  "https://www.svgrepo.com/show/27227/feather.svg",
  "https://www.svgrepo.com/show/105100/feather.svg",
  "https://www.svgrepo.com/show/68568/feather.svg",
  "https://www.svgrepo.com/show/159021/feather.svg"
];

export const FeatherFall = () => {
  const [Particles, setParticles] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    const loadParticles = async () => {
      try {
        const module = await import('react-tsparticles');
        setParticles(() => module.default);
      } catch (error) {
        console.error('Failed to load particles:', error);
      }
    };

    loadParticles();
  }, []);

  if (!Particles) return null;

  const getParticlesConfig = () => {
    const baseConfig = {
      background: {
        opacity: 0
      },
      style: {
        filter: "brightness(0) invert(1)"
      },
      particles: {
        color: {
          value: "#ffffff"
        },
        shape: {
          type: ["image", "image", "image", "image"],
          image: [
            {
              src: FEATHER_SOURCES[0],
              width: 64,
              height: 64
            },
            {
              src: FEATHER_SOURCES[1],
              width: 64,
              height: 64
            },
            {
              src: FEATHER_SOURCES[2],
              width: 64,
              height: 64
            },
            {
              src: FEATHER_SOURCES[3],
              width: 64,
              height: 64
            }
          ]
        },
        opacity: {
          value: 0.85,
          random: true,
          animation: {
            enable: true,
            speed: 0.2,
            minimumValue: 0.5,
            sync: false
          }
        },
        move: {
          enable: true,
          speed: 1.5,
          direction: "bottom",
          random: true,
          straight: false,
          outModes: {
            default: "out"
          },
          attract: {
            enable: true,
            rotateX: 300,
            rotateY: 600
          }
        },
        rotate: {
          value: {
            min: 0,
            max: 360
          },
          direction: "random",
          animation: {
            enable: true,
            speed: 5
          }
        },
        tilt: {
          direction: "random",
          enable: true,
          value: {
            min: 0,
            max: 360
          },
          animation: {
            enable: true,
            speed: 5
          }
        },
        wobble: {
          enable: true,
          distance: 10,
          speed: 5
        }
      },
      detectRetina: true
    };

    if (isMobile) {
      return {
        ...baseConfig,
        particles: {
          ...baseConfig.particles,
          number: {
            value: 15,
            density: {
              enable: true,
              value_area: 400
            }
          },
          size: {
            value: 20,
            random: {
              enable: true,
              minimumValue: 14
            }
          },
          move: {
            ...baseConfig.particles.move,
            speed: 0.6
          }
        }
      };
    }

    return {
      ...baseConfig,
      particles: {
        ...baseConfig.particles,
        number: {
          value: 15,
          density: {
            enable: true,
            value_area: 1000
          }
        },
        size: {
          value: 32,
          random: {
            enable: true,
            minimumValue: 24
          }
        }
      }
    };
  };

  return (
    <Particles
      id="feathers"
      init={particlesInit}
      options={getParticlesConfig()}
      className="fixed inset-0 pointer-events-none z-0 [&_canvas]:invert [&_canvas]:brightness-0"
    />
  );
}; 