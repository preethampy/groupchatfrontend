import React from 'react'
import { Container, Card } from 'react-bootstrap'
import styles from ".././styles/cs.module.css";

/**
 * @returns A message. This component will be shown to user as the user login successfully.
 */

export default function Main() {
    return (
        <Container className={styles.mainContainer} fluid>
            <div className={styles.mainHei90}>
                <Card className={styles.mainCard}>
                    <h5>Select or create a group to start group chat</h5>
                </Card>
            </div>
        </Container>
    )
}
