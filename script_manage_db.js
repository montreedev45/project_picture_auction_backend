const mongoose = require("mongoose");
const Bids = require("./models/Bid");
const Product = require("./models/Product");

const MONGO_URI =
  "";

const proIdList = Array.from({ length: 24 }, (_, i) => i + 1);

async function updateManyProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ DB connected");

    for (const proId of proIdList) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        console.log(`\n🚀 Processing pro_id: ${proId}`);

        const updatedProduct = await Product.findOneAndUpdate(
          { pro_id: proId },
          {
            $set: {
              pro_price: 100,
              pro_status: "",
              pro_accby: "",
              pro_time: 60,
            },
            $unset: {
              endTimeAuction: 1,
              startTimeAuction: 1,
            },
          },
          { new: true, session }
        );

        if (!updatedProduct) {
          console.log(`⚠️ Product not found for pro_id: ${proId}`);
          await session.abortTransaction();
          session.endSession();
          continue;
        }

        const result = await Bids.deleteMany({ pro_id: proId }, { session });

        console.log(`🧹 Deleted ${result.deletedCount} bids`);
        console.log(`✅ Updated product ${proId}`);

        await session.commitTransaction();
      } catch (error) {
        console.error(`❌ Failed for pro_id ${proId}:`, error);
        await session.abortTransaction();
      } finally {
        session.endSession();
      }
    }
  } catch (error) {
    console.error("Connection error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔒 Connection closed");
  }
}

updateManyProducts();