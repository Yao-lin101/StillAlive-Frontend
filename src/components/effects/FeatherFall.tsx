import { useCallback } from "react";
import { useEffect, useState } from "react";
import { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

export const FeatherFall = () => {
  const [Particles, setParticles] = useState<any>(null);

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

  return (
    <Particles
      id="feathers"
      init={particlesInit}
      options={{
        background: {
          opacity: 0
        },
        style: {
          filter: "brightness(0) invert(1)"
        },
        particles: {
          number: {
            value: 8,
            density: {
              enable: true,
              value_area: 1000
            }
          },
          color: {
            value: "#ffffff"
          },
          shape: {
            type: "image",
            image: {
              src: "https://www.svgrepo.com/show/159021/feather.svg",
              width: 64,
              height: 64
            }
          },
          opacity: {
            value: 0.6,
            random: true,
            animation: {
              enable: true,
              speed: 0.2,
              minimumValue: 0.3,
              sync: false
            }
          },
          size: {
            value: 32,
            random: {
              enable: true,
              minimumValue: 24
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
      }}
      className="fixed inset-0 pointer-events-none z-10 [&_canvas]:invert [&_canvas]:brightness-0"
    />
  );
}; 