import logo from '../assets/logo.png'

const starClip = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
const arrowClip = 'polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%)'

export default function TitleScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative overflow-hidden bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px' }}>

        {/* Top-left stripes */}
        <div style={{ position: 'absolute', width: '302.65px', height: '31.05px', left: '-102.09px', top: '44.7px', background: '#55337B', transform: 'matrix(-0.94, 0.34, -0.34, -0.94, 0, 0)' }} />
        <div style={{ position: 'absolute', width: '279.7px',  height: '31.05px', left: '-24.13px', top: '71.61px', background: '#B8E466', transform: 'matrix(-0.94, 0.34, -0.34, -0.94, 0, 0)' }} />
        <div style={{ position: 'absolute', width: '278.14px', height: '31.05px', left: '-63.07px', top: '134.27px', background: '#6166DB', transform: 'matrix(-0.94, 0.34, -0.34, -0.94, 0, 0)' }} />
        <div style={{ position: 'absolute', width: '283.17px', height: '31.05px', left: '-107px', top: '198.67px', background: '#B8E466', transform: 'matrix(-0.94, 0.34, -0.34, -0.94, 0, 0)' }} />

        {/* Top-left arrow polygons */}
        <div style={{ position: 'absolute', width: '54.85px', height: '25.45px', left: '175px',    top: '-5px', background: '#55337B', transform: 'rotate(-20deg)', clipPath: arrowClip }} />
        <div style={{ position: 'absolute', width: '44.84px', height: '31.05px', left: '231.82px', top: '21.7px', background: '#B8E466', transform: 'rotate(-20deg)', clipPath: arrowClip }} />
        <div style={{ position: 'absolute', width: '44.71px', height: '31.05px', left: '191.32px', top: '84.5px', background: '#6166DB', transform: 'rotate(-20deg)', clipPath: arrowClip }} />
        <div style={{ position: 'absolute', width: '44.84px', height: '31.05px', left: '152.33px', top: '147.5px', background: '#B8E466', transform: 'rotate(-20deg)', clipPath: arrowClip }} />

        {/* Top-left stars */}
        <div style={{ position: 'absolute', width: '47.3px', height: '47.3px', left: '280px', top: '-9spx', background: '#55337B', transform: 'rotate(-11deg)', clipPath: starClip }} />
        <div style={{ position: 'absolute', width: '47.3px', height: '47.3px', left: '240px', top: '57px', background: '#B8E466', transform: 'rotate(-11deg)', clipPath: starClip }} />
        <div style={{ position: 'absolute', width: '47.3px', height: '47.3px', left: '202px', top: '121px', background: '#6166DB', transform: 'rotate(-11deg)', clipPath: starClip }} />

        {/* Logo */}
        <img src={logo} alt="GamePlan logo" style={{ position: 'absolute', width: '417px', height: '375px', left: '15px', top: '260px', objectFit: 'contain' }} />

        {/* Bottom-right stripes (flipped from top) */}
        <div style={{ position: 'absolute', width: '302.65px', height: '31.05px', left: '239.44px', top: '880.25px', background: '#55337B', transform: 'matrix(0.94, -0.34, 0.34, 0.94, 0, 0)' }} />
        <div style={{ position: 'absolute', width: '279.7px',  height: '31.05px', left: '184.43px', top: '853.34px', background: '#B8E466', transform: 'matrix(0.94, -0.34, 0.34, 0.94, 0, 0)' }} />
        <div style={{ position: 'absolute', width: '278.14px', height: '31.05px', left: '224.93px', top: '790.68px', background: '#6166DB', transform: 'matrix(0.94, -0.34, 0.34, 0.94, 0, 0)' }} />
        <div style={{ position: 'absolute', width: '283.17px', height: '31.05px', left: '263.83px', top: '726.28px', background: '#B8E466', transform: 'matrix(0.94, -0.34, 0.34, 0.94, 0, 0)' }} />

        {/* Bottom-right arrow polygons (flipped from top) */}
        <div style={{ position: 'absolute', width: '54.85px', height: '25.45px', left: '210.15px', top: '935.55px', background: '#55337B', transform: 'rotate(160deg)', clipPath: arrowClip }} />
        <div style={{ position: 'absolute', width: '44.84px', height: '31.05px', left: '163.34px', top: '903.25px', background: '#B8E466', transform: 'rotate(160deg)', clipPath: arrowClip }} />
        <div style={{ position: 'absolute', width: '44.71px', height: '31.05px', left: '203.97px', top: '840.45px', background: '#6166DB', transform: 'rotate(160deg)', clipPath: arrowClip }} />
        <div style={{ position: 'absolute', width: '44.84px', height: '31.05px', left: '242.83px', top: '777.45px', background: '#B8E466', transform: 'rotate(160deg)', clipPath: arrowClip }} />

        {/* Bottom-right stars (flipped from top) */}
        <div style={{ position: 'absolute', width: '47.3px', height: '47.3px', left: '112.7px',  top: '917.7px', background: '#55337B', transform: 'rotate(169deg)', clipPath: starClip }} />
        <div style={{ position: 'absolute', width: '47.3px', height: '47.3px', left: '152.7px',  top: '851.7px', background: '#B8E466', transform: 'rotate(169deg)', clipPath: starClip }} />
        <div style={{ position: 'absolute', width: '47.3px', height: '47.3px', left: '190.7px',  top: '787.7px', background: '#6166DB', transform: 'rotate(169deg)', clipPath: starClip }} />

      </div>
    </div>
  )
}
