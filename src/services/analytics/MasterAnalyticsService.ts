import { supabase } from "../../lib/supabase";
import FreePropertyDataService from "../FreePropertyDataService";
import FreePropertyIntelligence from "../FreePropertyIntelligence";
import { HubSpotService } from "../hubspotService";
import SubscriptionService from "../SubscriptionService";

export interface MasterAnalytics {
  overview: {
    totalProperties: number;
    qualifiedLeads: number;
    activeSubscribers: number;
    conversionRate: number;
    monthlyRevenue: number;
  };
  propertyIntelligence: {
    foreclosureRisk: number;
    averageEquity: number;
    marketTrends: any[];
    hotspotAreas: any[];
  };
  marketing: {
    campaignPerformance: any[];
    leadSources: any[];
    conversionFunnels: any[];
    roi: number;
  };
  education: {
    courseCompletions: number;
    averageProgress: number;
    topCourses: any[];
    certificatesIssued: number;
  };
}

class MasterAnalyticsService {
  private propertyService: any;
  private intelligenceService: any;
  private hubspotService: any;
  private subscriptionService: any;

  constructor() {
    this.propertyService = FreePropertyDataService;
    this.intelligenceService = FreePropertyIntelligence;
    this.hubspotService = HubSpotService;
    this.subscriptionService = SubscriptionService;
  }

  async getMasterAnalytics(
    timeRange: string = "30d",
  ): Promise<MasterAnalytics> {
    try {
      const [overview, propertyData, marketingData, educationData] =
        await Promise.all([
          this.getOverviewMetrics(timeRange),
          this.getPropertyIntelligence(timeRange),
          this.getMarketingAnalytics(timeRange),
          this.getEducationAnalytics(timeRange),
        ]);

      return {
        overview,
        propertyIntelligence: propertyData,
        marketing: marketingData,
        education: educationData,
      };
    } catch (error) {
      console.error("Error fetching master analytics:", error);
      throw error;
    }
  }

  private async getOverviewMetrics(timeRange: string) {
    try {
      // Get data from your existing services
      const [propertyCount, subscriptionData, hubspotData] = await Promise.all([
        this.getPropertyCount(),
        this.subscriptionService.getActiveSubscriptions(),
        this.hubspotService.getDeals({ limit: 1000 }),
      ]);

      // Calculate conversion rate from your existing data
      const totalLeads = hubspotData?.results?.length || 0;
      const qualifiedLeads =
        hubspotData?.results?.filter(
          (deal: any) => deal.properties.dealstage === "qualified",
        ).length || 0;

      const conversionRate =
        totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

      // Calculate monthly revenue from subscriptions
      const monthlyRevenue =
        subscriptionData?.reduce(
          (acc: number, sub: any) => acc + (sub.amount || 0),
          0,
        ) || 0;

      return {
        totalProperties: propertyCount,
        qualifiedLeads,
        activeSubscribers: subscriptionData?.length || 0,
        conversionRate,
        monthlyRevenue,
      };
    } catch (error) {
      console.error("Error getting overview metrics:", error);
      return {
        totalProperties: 0,
        qualifiedLeads: 0,
        activeSubscribers: 0,
        conversionRate: 0,
        monthlyRevenue: 0,
      };
    }
  }

  private async getPropertyIntelligence(timeRange: string) {
    try {
      // Use your existing FreePropertyIntelligence service
      const marketData = await this.intelligenceService.getMarketAnalysis();
      const foreclosureData =
        await this.intelligenceService.getForeclosureRisk();

      // Integrate with your FreePropertyDataService
      const propertyTrends = await this.propertyService.getPropertyTrends();

      return {
        foreclosureRisk: foreclosureData?.riskScore || 0,
        averageEquity: marketData?.averageEquity || 0,
        marketTrends: propertyTrends || [],
        hotspotAreas: await this.getHotspotAreas(),
      };
    } catch (error) {
      console.error("Error getting property intelligence:", error);
      return {
        foreclosureRisk: 0,
        averageEquity: 0,
        marketTrends: [],
        hotspotAreas: [],
      };
    }
  }

  private async getMarketingAnalytics(timeRange: string) {
    try {
      // Get campaign data from your existing tables
      const { data: campaigns } = await supabase
        .from("mail_campaigns")
        .select("*")
        .gte("created_at", this.getDateFromRange(timeRange));

      // Get lead source data from HubSpot
      const leadSources = await this.hubspotService.getLeadSources();

      // Calculate ROI from your existing data
      const totalCost =
        campaigns?.reduce((acc, c) => acc + (c.total_cost || 0), 0) || 0;
      const totalRevenue = await this.calculateRevenueFromCampaigns(campaigns);
      const roi =
        totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

      return {
        campaignPerformance: campaigns || [],
        leadSources: leadSources || [],
        conversionFunnels: await this.getConversionFunnels(),
        roi,
      };
    } catch (error) {
      console.error("Error getting marketing analytics:", error);
      return {
        campaignPerformance: [],
        leadSources: [],
        conversionFunnels: [],
        roi: 0,
      };
    }
  }

  private async getEducationAnalytics(timeRange: string) {
    try {
      // Get education data from your existing tables
      const { data: completions } = await supabase
        .from("user_progress")
        .select("*")
        .not("completed_at", "is", null)
        .gte("completed_at", this.getDateFromRange(timeRange));

      const { data: certificates } = await supabase
        .from("certificates")
        .select("*")
        .gte("issued_at", this.getDateFromRange(timeRange));

      const { data: allProgress } = await supabase
        .from("user_progress")
        .select("completion_percentage");

      const averageProgress =
        allProgress?.length > 0
          ? allProgress.reduce(
              (acc, p) => acc + (p.completion_percentage || 0),
              0,
            ) / allProgress.length
          : 0;

      return {
        courseCompletions: completions?.length || 0,
        averageProgress,
        topCourses: await this.getTopCourses(),
        certificatesIssued: certificates?.length || 0,
      };
    } catch (error) {
      console.error("Error getting education analytics:", error);
      return {
        courseCompletions: 0,
        averageProgress: 0,
        topCourses: [],
        certificatesIssued: 0,
      };
    }
  }

  // Advanced Property Analysis Integration
  async getAdvancedPropertyAnalytics(zipCode?: string) {
    try {
      // Integrate your existing property services
      const [propertyData, marketAnalysis, foreclosureRisk] = await Promise.all(
        [
          this.propertyService.searchProperties({ zipCode }),
          this.intelligenceService.getMarketAnalysis(zipCode),
          this.intelligenceService.getForeclosureRisk(zipCode),
        ],
      );

      return {
        properties: propertyData,
        marketInsights: marketAnalysis,
        riskAnalysis: foreclosureRisk,
        recommendations:
          await this.generatePropertyRecommendations(propertyData),
      };
    } catch (error) {
      console.error("Error getting advanced property analytics:", error);
      throw error;
    }
  }

  // HubSpot Integration Analytics
  async getHubSpotAnalytics() {
    try {
      const [deals, contacts, companies, activities] = await Promise.all([
        this.hubspotService.getDeals({ limit: 1000 }),
        this.hubspotService.getContacts({ limit: 1000 }),
        this.hubspotService.getCompanies({ limit: 500 }),
        this.hubspotService.getActivities(),
      ]);

      return {
        dealsPipeline: this.analyzeDealsPipeline(deals.results),
        contactEngagement: this.analyzeContactEngagement(contacts.results),
        companyInsights: this.analyzeCompanies(companies.results),
        activityTrends: this.analyzeActivities(activities.results),
      };
    } catch (error) {
      console.error("Error getting HubSpot analytics:", error);
      throw error;
    }
  }

  // Subscription Analytics Integration
  async getSubscriptionAnalytics() {
    try {
      const subscriptions =
        await this.subscriptionService.getAllSubscriptions();

      return {
        monthlyRecurringRevenue: this.calculateMRR(subscriptions),
        churnRate: this.calculateChurnRate(subscriptions),
        customerLifetimeValue: this.calculateCLV(subscriptions),
        subscriptionTrends: this.analyzeSubscriptionTrends(subscriptions),
        featureUsage: await this.getFeatureUsageStats(),
      };
    } catch (error) {
      console.error("Error getting subscription analytics:", error);
      throw error;
    }
  }

  // AI-Powered Insights
  async getAIInsights() {
    try {
      const masterData = await this.getMasterAnalytics();

      return {
        marketOpportunities: this.identifyMarketOpportunities(masterData),
        leadScoringInsights: this.generateLeadScoringInsights(masterData),
        campaignOptimizations: this.suggestCampaignOptimizations(masterData),
        educationRecommendations:
          this.generateEducationRecommendations(masterData),
      };
    } catch (error) {
      console.error("Error getting AI insights:", error);
      throw error;
    }
  }

  // Helper methods
  private getDateFromRange(range: string): string {
    const now = new Date();
    const days = parseInt(range.replace("d", ""));
    const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }

  private async getPropertyCount(): Promise<number> {
    try {
      const { count } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });
      return count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getHotspotAreas() {
    // Implement hotspot identification logic using your property data
    return [];
  }

  private async calculateRevenueFromCampaigns(
    campaigns: any[],
  ): Promise<number> {
    // Calculate revenue generated from campaigns
    return 0;
  }

  private async getConversionFunnels() {
    // Analyze conversion funnels from your data
    return [];
  }

  private async getTopCourses() {
    try {
      const { data } = await supabase
        .from("user_progress")
        .select("course_id, courses(title)")
        .not("completed_at", "is", null);

      const courseCounts = data?.reduce((acc: any, item: any) => {
        const courseTitle = item.courses?.title;
        if (courseTitle) {
          acc[courseTitle] = (acc[courseTitle] || 0) + 1;
        }
        return acc;
      }, {});

      return Object.entries(courseCounts || {})
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([title, count]) => ({ title, completions: count }));
    } catch (error) {
      return [];
    }
  }

  private generatePropertyRecommendations(properties: any[]) {
    // AI-powered property recommendations
    return [];
  }

  private analyzeDealsPipeline(deals: any[]) {
    // Analyze deals pipeline
    return {};
  }

  private analyzeContactEngagement(contacts: any[]) {
    // Analyze contact engagement
    return {};
  }

  private analyzeCompanies(companies: any[]) {
    // Analyze companies
    return {};
  }

  private analyzeActivities(activities: any[]) {
    // Analyze activities
    return {};
  }

  private calculateMRR(subscriptions: any[]): number {
    return subscriptions.reduce(
      (acc, sub) => acc + (sub.monthlyAmount || 0),
      0,
    );
  }

  private calculateChurnRate(subscriptions: any[]): number {
    // Calculate churn rate
    return 0;
  }

  private calculateCLV(subscriptions: any[]): number {
    // Calculate customer lifetime value
    return 0;
  }

  private analyzeSubscriptionTrends(subscriptions: any[]) {
    // Analyze subscription trends
    return [];
  }

  private async getFeatureUsageStats() {
    // Get feature usage statistics
    return {};
  }

  private identifyMarketOpportunities(data: MasterAnalytics) {
    // AI-powered market opportunity identification
    return [];
  }

  private generateLeadScoringInsights(data: MasterAnalytics) {
    // Generate lead scoring insights
    return {};
  }

  private suggestCampaignOptimizations(data: MasterAnalytics) {
    // Suggest campaign optimizations
    return [];
  }

  private generateEducationRecommendations(data: MasterAnalytics) {
    // Generate education recommendations
    return [];
  }
}

export default new MasterAnalyticsService();
