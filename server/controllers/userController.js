import sql from "../configs/db.js";

const getUserCreations = async (req, res) => {
    try {
        const {userId} = req.auth();

        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

        res.json({success: true, creations});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

const getPublishedCreations = async (req, res) => {
    try {
        const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

        res.json({success: true, creations});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

const toggleLikeCreation = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {creationId} = req.body;

        const [creation] = await sql `SELECT * FROM creations WHERE id = ${creationId}`;

        if (!creation) {
            return res.json({success: false, message: "Creation not found"});
        }

        const currentLikes = creation.likes || [];

        const userIdStr = userId.toString();

        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter(id => id !== userIdStr);
            message = "Creation unliked";
        } else {
            updatedLikes = [...currentLikes, userIdStr];
            message = "Creation liked";
        }

        const formattedArray = `{${updatedLikes.join(",")}}`;

        await sql`UPDATE creations SET likes = ${formattedArray}::TEXT[] WHERE id = ${creationId}`;

        res.json({success: true, message});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};


export {getUserCreations, getPublishedCreations, toggleLikeCreation};