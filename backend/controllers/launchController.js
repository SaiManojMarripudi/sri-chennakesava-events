const { pool } =
    require('../config/db');


// ==========================================
// GET CURRENT WEBSITE LAUNCH STATUS
// PUBLIC
// ==========================================

const getLaunchStatus = async (
    req,
    res
) => {

    try {

        const [rows] =
            await pool.execute(
                `
                SELECT
                    id,
                    status,
                    launch_started_at,
                    launched_at,
                    updated_at

                FROM site_launch

                WHERE id = 1

                LIMIT 1
                `
            );


        if (
            rows.length === 0
        ) {

            return res.status(500).json({

                success: false,

                message:
                    'Website launch configuration is missing.'

            });

        }


        return res.status(200).json({

            success: true,

            launch:
                rows[0]

        });

    } catch (error) {

        console.error(
            'Get launch status error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to retrieve website launch status.'

        });

    }

};


// ==========================================
// START WEBSITE LAUNCH
// ADMIN ONLY
// ==========================================

const startWebsiteLaunch = async (
    req,
    res
) => {

    let connection;

    try {

        connection =
            await pool.getConnection();


        await connection.beginTransaction();


        const [rows] =
            await connection.execute(
                `
                SELECT
                    id,
                    status,
                    launch_started_at,
                    launched_at

                FROM site_launch

                WHERE id = 1

                LIMIT 1

                FOR UPDATE
                `
            );


        if (
            rows.length === 0
        ) {

            await connection.rollback();

            return res.status(500).json({

                success: false,

                message:
                    'Website launch configuration is missing.'

            });

        }


        const launch =
            rows[0];


        // ======================================
        // ALREADY LIVE
        // ======================================

        if (
            launch.status === 'LIVE'
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    'The website is already live.'

            });

        }


        // ======================================
        // LAUNCH ALREADY IN PROGRESS
        // ======================================

        if (
            launch.status === 'LAUNCHING'
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    'Website launch is already in progress.'

            });

        }


        // ======================================
        // START LAUNCH
        // ======================================

        const startedAt =
            new Date();


        await connection.execute(
            `
            UPDATE site_launch

            SET
                status = 'LAUNCHING',
                launch_started_at = ?,
                launched_at = NULL

            WHERE id = 1
            `,
            [
                startedAt
            ]
        );


        await connection.commit();


        return res.status(200).json({

            success: true,

            message:
                'Website launch started.',

            status:
                'LAUNCHING',

            launch_started_at:
                startedAt

        });

    } catch (error) {

        if (connection) {

            await connection.rollback();

        }


        console.error(
            'Start website launch error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to start website launch.'

        });

    } finally {

        if (connection) {

            connection.release();

        }

    }

};


// ==========================================
// MAKE WEBSITE LIVE
// ADMIN ONLY
// ==========================================

const completeWebsiteLaunch = async (
    req,
    res
) => {

    let connection;

    try {

        connection =
            await pool.getConnection();


        await connection.beginTransaction();


        const [rows] =
            await connection.execute(
                `
                SELECT
                    id,
                    status,
                    launch_started_at,
                    launched_at

                FROM site_launch

                WHERE id = 1

                LIMIT 1

                FOR UPDATE
                `
            );


        if (
            rows.length === 0
        ) {

            await connection.rollback();

            return res.status(500).json({

                success: false,

                message:
                    'Website launch configuration is missing.'

            });

        }


        const launch =
            rows[0];


        if (
            launch.status !==
            'LAUNCHING'
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    'Website is not currently launching.'

            });

        }


        const launchedAt =
            new Date();


        await connection.execute(
            `
            UPDATE site_launch

            SET
                status = 'LIVE',
                launched_at = ?

            WHERE id = 1
            `,
            [
                launchedAt
            ]
        );


        await connection.commit();


        return res.status(200).json({

            success: true,

            message:
                'SRI CHENNAKESAVA EVENTS is now live.',

            status:
                'LIVE',

            launched_at:
                launchedAt

        });

    } catch (error) {

        if (connection) {

            await connection.rollback();

        }


        console.error(
            'Complete website launch error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Unable to complete website launch.'

        });

    } finally {

        if (connection) {

            connection.release();

        }

    }

};


module.exports = {

    getLaunchStatus,

    startWebsiteLaunch,

    completeWebsiteLaunch

};