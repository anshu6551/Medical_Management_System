const Subscription = require("../models/SubscriptionModel");
const httpStatusCode = require("../utils/httpStatusCode");

class SubscriptionController {
  // 1. Create New Subscription Plan
  async createSubscription(req, res) {
    try {
      const { name, price, period, features, highlight } = req.body;

      if (!name || price === undefined || !period) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Name, price, and period are required",
        });
      }

      // Check duplicate plan name
      const existingPlan = await Subscription.findOne({ name: name.trim() });
      if (existingPlan) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "A subscription plan with this name already exists",
        });
      }

      const plan = await Subscription.create({
        name: name.trim(),
        price,
        period,
        features: features || [],
        highlight: highlight || false,
      });

      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Subscription plan created successfully",
        data: plan,
      });
    } catch (err) {
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }

  // 2. Get All Subscription Plans
  async getAllSubscriptions(req, res) {
    try {
      const plans = await Subscription.find().sort({ price: 1 });

      return res.status(httpStatusCode.OK).json({
        success: true,
        count: plans.length,
        data: plans,
      });
    } catch (err) {
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }

  // 3. Update Plan Details
  async updateSubscription(req, res) {
    try {
      const { planId } = req.params;
      const updatedPlan = await Subscription.findByIdAndUpdate(planId, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedPlan) {
        return res.status(httpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Subscription plan not found",
        });
      }

      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Plan updated successfully",
        data: updatedPlan,
      });
    } catch (err) {
      return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  }
}

module.exports = new SubscriptionController();