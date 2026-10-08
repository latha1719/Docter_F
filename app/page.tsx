import Link from 'next/link'
import Image from 'next/image'
import styles from './home.module.css'

export default function Home() {
  return (
    <div className={styles.homeWrapper}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              World-Class Care at Your Fingertips
            </h1>
            <p className={styles.heroSubtitle}>
              Our hospital provides access to highly qualified and experienced doctors across multiple specialties. Book your professional consultation in seconds.
            </p>
            <div className={styles.heroBtns}>
              <Link href="/doctors">
                <button className={styles.primaryBtn}>Explore Specialists</button>
              </Link>
            </div>
          </div>
          <div className={styles.heroImageWrapper}>
            <Image
              src="/img2.jpg"
              alt="Professional Doctor"
              width={480}
              height={320}
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </section>

      {/* ABOUT SECTION - Using provided text */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <h2>Why Choose Our Platform?</h2>
          <p className={styles.aboutText}>
            Our platform highlights trusted doctors like <strong>cardiologists, dermatologists, and neurosurgeons</strong>. 
            Each doctor profile includes a professional photo, name, and area of expertise for easy identification. 
            Patients can view years of experience to choose the right specialist confidently.
          </p>
          <p className={styles.aboutText}>
            Every profile is designed to give a clear and user-friendly overview of the doctor's background. 
            This helps patients make quick and informed decisions while booking appointments. 
            Our goal is to ensure a smooth, reliable, and efficient doctor consultation experience for everyone.
          </p>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🛡️</span>
              <div className={styles.featureTitle}>Trusted Experts</div>
              <div className={styles.featureDesc}>Verified background and qualifications for every specialist.</div>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>⚡</span>
              <div className={styles.featureTitle}>Instant Booking</div>
              <div className={styles.featureDesc}>Real-time availability and immediate appointment confirmation.</div>
            </div>
          </div>
        </div>

        <div className={styles.imageOverlay}>
          <Image 
            src="/img4.jpg" 
            alt="Professional Doctor" 
            width={600}
            height={400}
            className={styles.aboutImage}
          />
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '3rem', borderTop: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '0.9rem' }}>
        &copy; 2026 Doctor Online Appointment System. All rights reserved.
      </footer>
    </div>
  )
}